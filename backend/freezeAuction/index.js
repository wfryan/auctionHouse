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

    let freezeAuction = (auId, status) => {
        let queryStr = "UPDATE auctions SET status=? WHERE auction_id=?"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, [status, auId], (error, rows) => {
                if (error) { return reject(error) }
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
        auth = event.token;
        token = auth.split(" ")[1];
        let decoded = jwt.verify(token, JWT_SECRET);




        if (decoded.account_type != 'admin') {
            return {
                statusCode: 400,
                body: "invalid credentials"
            }
        }

    } catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Jwt Invalid" })
        };
    }


    let auctionId = event.auctionId;


    console.log(event)
    let status = event.status;
    const updatedAuction = await freezeAuction(auctionId, status);

    pool.close();


    if (updatedAuction !== null && updatedAuction) {
        response = {
            statusCode: 200,
            body: JSON.stringify({ message: updatedAuction })
        }
    }
    else {
        response = {
            statusCode: 400,
            body: JSON.stringify({ message: 'Publish Failed' })
        }
    }
    return response;
};
