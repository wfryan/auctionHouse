import mysql from 'mysql2/promise'
export const handler = async (event) => {
    let connection
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true
        })
        const [userInfo] = await connection.query("SELECT user_id, account_type, balance, description, age, location, is_active FROM users WHERE username = ?", event.username)
        //TODO: return tmp used funds for user (get from placeBid)
        console.log(userInfo[0])
        return {
            statusCode: 200,
            body: { user: userInfo[0] }
        }
    }
    catch (error) {
        return
    } finally {
        await connection.end()
    }
};
