import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'

const verifyToken = (auth) => {
    try {
        jwt.verify(auth, process.env.JWT_SECRET);
        return true;
    } catch (error) {
        return false;
    }
};

export const handler = async (event) => {
    let connection = await mysql.createConnection({
        host: "auctionhouse.c32su8ym6ttr.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "auctionHouse!",
        database: "auction_house",
        port: 3306
    })
    const auth = event.token.split(" ")[1]; // Bearer <token>
    if (!verifyToken(auth)) {
        return {
            statusCode: 418,
            message: 'Invalid token'
        };
    }
    const username = event.username
    if (!username) {
        return {
            statusCode: 402,
            message: 'Username is required'
        }
    }
    try {
        let [auction] = await connection.query("SELECT * FROM auctions WHERE auction_id = ? AND status = ?", [event.auction_id, "unlisted"])
        if (auction.length == 0) {
            throw new Error("Auction not found")
        }
        else {
            await connection.query("UPDATE auctions SET status=? WHERE auction_id = ?", ["archived", event.auction_id])
            return { statusCode: 200 }
        }
    }
    catch (error) {
        console.log(error)
        if (error == "Auction not found") { //placeholder for if item could not be found
            return { statusCode: 401, message: "There was an error finding the auction" }
        } else { //other errors
            return { statusCode: 400, message: "There was an unexpected error" }
        }
    }
    finally {
        await connection.end()
    }
};
