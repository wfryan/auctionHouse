import mysql from 'mysql2'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.SECRET;

export const handler = async (event) => {
    let pool = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true
    });

    let getBid = (auId) => {
        let queryStr = "SELECT * FROM bids JOIN auctions ON bids.bid_id=auctions.winner_id WHERE auctions.auction_id=?"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, [auId], (error, rows) => {
                if (error) { return reject(error) }
                else if (rows.length > 0) {
                    return resolve([rows[0].buyer_id])
                }
                else {
                    reject(JSON.stringify(rows[0]))
                }
            })
        })
    }

    let checkBalance = (auId, buyId) => {
        let queryStr = "SELECT a.starting_bid, CASE WHEN u.balance >= a.starting_bid THEN 1 ELSE 0 END AS balcheck FROM auction_house.users u JOIN auction_house.auctions a WHERE u.user_id = ? AND a.auction_id = ?"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, [buyId, auId], (error, rows) => {
                if (error) { return reject(error) }
                else if (rows[0].balcheck > 0) {
                    return resolve([true, rows[0].starting_bid])
                }
                else {
                    reject(JSON.stringify(rows[0]))
                }
            })
        })
    }

    let fulfill = (auId) => {
        let queryStr = "UPDATE auctions SET status=? WHERE auction_id=? AND status=?"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, ['archived', auId, 'bought'], (error, rows) => {
                if (error) { return reject(error) }
                else {
                    return resolve(true)
                }
            })
        })
    }

    let updateBalance = (buyId, bal) => {
        let queryStr = "UPDATE users SET balance= balance - ? WHERE user_id = ?"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, [bal, buyId], (error, rows) => {
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

            return decoded['id'];
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
            body: JSON.stringify({ message: "Error", error })
        };
    }

    let verified = verifyToken(token)
    if (!verified) {
        response = {
            statusCode: 418,
            body: JSON.stringify({ message: verified })
        }
        return response;
    }
    let auctionId = event.auctionId;
    let bid = await getBid(auctionId);

    let balCheck = await checkBalance(auctionId, bid)
    if (balCheck[0] != true) {
        response = {
            statusCode: 400,
            error: balCheck
        }
        return response;
    }

    const updatedAuction = await fulfill(auctionId);
    const updatedBal = await updateBalance(verified, balCheck[1])
    pool.close();

    if (updatedAuction !== null && updatedAuction) {
        response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Purchase succesful!' })
        }
    }
    else {
        response = {
            statusCode: 400,
            body: JSON.stringify({ message: 'Purchase Failed' })
        }
    }

    if (updatedBal === null || !updatedBal) {
        response = {
            statusCode: 400,
            body: JSON.stringify({ message: 'balance failed to update. contact admins' })
        }
    }
    return response;
};
