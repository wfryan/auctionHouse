import mysql from 'mysql2/promise'
import * as argon2 from 'argon2'

export const handler = async (event) => {
    let connection
    try{
        connection = await mysql.createConnection({
            host: "auctionhouse.c32su8ym6ttr.us-east-2.rds.amazonaws.com",
            user: "admin",
            password: "auctionHouse!",
            database: "auction_house",
            port: 3306
        });

        const [existing] = await connection.query("SELECT * FROM users WHERE username = ?", [event.username])
        if(existing.length != 0){
            return {
                statusCode: 400,
                body: {message: "Username exists"}
            }
        }
        const [max] = await connection.query("SELECT MAX(user_id) AS maxId FROM users")
        const newId = (max[0].maxId || 0) + 1

        const hashedPass = await argon2.hash(event.password)

        console.log(hashedPass)

        const [result] = await connection.query(
            "INSERT INTO users (user_id, username, password, location, account_type, age, balance) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [newId, event.username, hashedPass, event.location, event.type, event.age, 0]
        )

        return{
            statusCode: 200,
            body: { success: true, userId: newId }
        }
    }
    catch(error){
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: error.message },
        };
    }
    finally{
        await connection.end()
    }
}