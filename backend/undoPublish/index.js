import mysql from 'mysql2'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.SECRET; // Use environment variables in production

export const handler = async (event) => {

    let pool = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true
    });

    let unpublishAuction = (auId) => {
        let queryStr = "UPDATE auctions SET status=? WHERE auction_id=? AND highest_bid IS NULL"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, ['unlisted', auId], (error, rows) => {
                if (error) { return reject(error) }
                if (rows.affectedRows < 1) {
                    return resolve(false)
                }
                else {
                    return resolve(true)
                }
            })
        })
    }

    let verifyToken = (tkn) => {
        try {
            let decoded = jwt.verify(tkn, JWT_SECRET);

            return true;
        } catch (error) {
            return false
        }
    }


    let response;

    let token;
    let auth;
    try {
        auth = event.token

        token = auth.split(" ")[1];

    } catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Error" })
        };
    }

    if (!verifyToken(token)) {
        response = {
            statusCode: 418,
            body: JSON.stringify({ message: token })
        }
        return response;
    }


    let auctionId = event.auctionId;


    console.log(event)
    const updatedAuction = await unpublishAuction(auctionId);

    pool.close();

    if (updatedAuction !== null && updatedAuction) {
        response = {
            statusCode: 200,
            body: JSON.stringify(updatedAuction)
        }
    }
    else if (!updatedAuction) {
        response = {
            statusCode: 400,
            body: "Auction already has bids. Unable to unpublish"
        }
    }
    else {
        response = {
            statusCode: 400,
            body: JSON.stringify(updatedAuction)
        }
    }
    return response;
};
