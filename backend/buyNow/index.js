import mysql from 'mysql2'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.SECRET; // Use environment variables in production

export const handler = async (event) => {

    let pool = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });


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

    let makeTransaction = (auctionId, buyerId, price) => {
        let queryStr = "INSERT INTO bids (auction_id, buyer_id, amount) VALUES (?, ?, ?)"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, [auctionId, buyerId, price], (error, rows) => {
                if (error) { return reject(error) }
                else {
                    return resolve(rows.insertId)
                }
            })
        })
    }

    let buyNow = (bidId, auId) => {
        let queryStr = "UPDATE auctions SET status=?, winner_id=? WHERE auction_id=? AND status=?"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, ['bought', bidId, auId, 'active'], (error, rows) => {
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
            body: JSON.stringify({ message: token })
        }
        return response;
    }
    let auctionId = event.auctionId;
    let balCheck = await checkBalance(auctionId, verified)
    if (balCheck[0] != true) {
        response = {
            statusCode: 400,
            error: balCheck
        }
        return response;
    }

    const transaction = await makeTransaction(auctionId, verified, balCheck[1]);

    const updatedAuction = await buyNow(transaction, auctionId);
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
