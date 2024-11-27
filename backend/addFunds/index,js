import mysql from 'mysql2/promise'
export const handler = async (event) => {
    let connection
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        })
        console.log("connection est")
        let [result] = await connection.query("SELECT balance FROM users WHERE username = ?", [event.username])
        if (result.length == 0) {
            throw new Error()
        }
        console.log("cur bal gotten")
        let amount = result[0].balance
        amount += parseInt(event.addFunds)
        console.log("added new funds to cur bal")
        const [test] = await connection.query("UPDATE users SET balance = ? WHERE username = ?", [amount, event.username])
        //TODO: also return tmp used funds with user (get SQL query from placeBid)
        console.log("updated")
        return {
            statusCode: 200,
            body: { curFunds: amount }
        }
    }
    catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: { message: "Failed to add funds" }
        }
    }
};
