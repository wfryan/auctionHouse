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

    let reviewBids = (buyerId) => {
        let queryStr = "SELECT b.*, ai.item_name,a.item_id, a.status AS auction_status, amount = (SELECT MAX(amount) FROM bids WHERE auction_id = b.auction_id) AS is_highest_bid FROM bids b JOIN auctions a ON b.auction_id = a.auction_id JOIN auction_items ai ON a.item_id = ai.auction_item_id WHERE amount = (SELECT MAX(amount) FROM bids WHERE auction_id = b.auction_id AND buyer_id = b.buyer_id) AND buyer_id = ?"
        return new Promise((resolve, reject) => {
            pool.query(queryStr, [buyerId], (error, rows) => {
                if (error) { return reject(error) }
                if (!(rows) || rows.length < 1) {
                    return resolve("No active bids!")
                }
                else {
                    const organizedBids = {
                        completed: [],
                        winning: [],
                        failed: [],
                        trailing: []
                    }

                    rows.forEach(auction => {
                        if ((auction.auction_status === 'bought' || auction.auction_status === 'archived') && auction.is_highest_bid === 1) {
                            organizedBids.completed.push(auction);
                        } else if ((auction.auction_status === 'bought' || auction.auction_status === 'archived') && auction.is_highest_bid === 0) {
                            organizedBids.failed.push(auction);
                        } else if (auction.is_highest_bid === 1 && auction.auction_status === 'active') {
                            organizedBids.winning.push(auction);
                        } else if (auction.is_highest_bid === 0 && auction.auction_status === 'active') {
                            organizedBids.trailing.push(auction);
                        }
                    });
                    return resolve(organizedBids)
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
            status: 401,
            body: JSON.stringify({ message: "Error" })
        };
    }

    let verified = verifyToken(token)
    if (!verified) {
        response = {
            status: 418,
            body: JSON.stringify({ message: "invalid session" })
        }
        return response;
    }
    const bids = await reviewBids(verified);

    pool.close();

    if (bids !== null && !!bids) {
        response = {
            statusCode: 200,
            body: bids
        }
    }

    else if (typeof (bids) === String) {
        const organizedBids = {
            completed: [],
            winning: [],
            failed: [],
            trailing: []
        }
        response = {

            statusCode: 200,
            body: organizedBids,
            message: "No active bids"
        }
    }
    else {
        response = {
            statusCode: 400,
            body: JSON.stringify(bids)
        }
    }
    return response;
};
