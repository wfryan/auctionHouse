import mysql from 'mysql2/promise'
import * as argon2 from 'argon2'

export const handler = async (event) => {
    let connection
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        })
        const [user] = await connection.query("SELECT * FROM users WHERE user_id = ?", [event.user_id])
        if (user[0].account_type == "buyer") {
            const [activeBiddedAuctions] = await connection.query("SELECT bids.* FROM bids JOIN auctions ON bids.auction_id = auctions.auction_id WHERE bids.buyer_id = ? AND auctions.status = ?", [event.user_id, "active"])
            const [unfulfilledAuctions] = await connection.query("SELECT * FROM auctions WHERE winner_id = ? AND status = ?", [event.user_id, "bought"]) //no auctions where they are unfulfilled and winner id is user id relating to user trying to close account
            if (activeBiddedAuctions.length == 0 && unfulfilledAuctions.length == 0) { //if no conflicting bids and no conflicting auctions
                const isMatch = await argon2.verify(user[0].password, event.password)
                if (isMatch) {
                    await connection.query("UPDATE users SET is_active = ? WHERE user_id = ?", [0, event.user_id])
                }
            }
            const [updatedUser] = await connection.query("SELECT user_id, description, age, location, balance, account_type, is_active FROM users WHERE user_id = ?", [event.user_id])
            console.log(updatedUser[0])
            const statusCode = (updatedUser[0].is_active == 0 ? 200 : 400)
            const message = (statusCode == 200 ? "Account closed" : (activeBiddedAuctions.length == 0 ? "Password does not match" : "You have active auctions"))
            return {
                statusCode: statusCode,
                body: { message: message, user: updatedUser[0] }
            }
        }
        else { //if seller account
            const [conflictingAuctions] = await connection.query("SELECT * FROM auctions WHERE seller_id = ? AND (status = ? OR status = ?)", [event.user_id, "active", "bought"]) //retrieves auctions either has active or has not fulfilled yet
            if (conflictingAuctions.length == 0) {
                const isMatch = await argon2.verify(user[0].password, event.password)
                if (isMatch) {
                    await connection.query("UPDATE users SET is_active = ? WHERE user_id = ?", [0, event.user_id])
                }
            }
            const [updatedUser] = await connection.query("SELECT user_id, description, age, location, balance, account_type, is_active FROM users WHERE user_id = ?", [event.user_id])
            const statusCode = (updatedUser[0].is_active == 0 ? 200 : 400)
            const message = (statusCode == 200 ? "Account closed" : (conflictingAuctions.length == 0 ? "Password does not match" : "You have active auctions"))
            return {
                statusCode: statusCode,
                body: { message: message, user: updatedUser[0] }
            }
        }
    } catch (error) {
        console.error(error)
    } finally {
        await connection.end()
    }
};
