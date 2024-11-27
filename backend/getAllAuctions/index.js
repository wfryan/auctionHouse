import mysql from 'mysql2'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.SECRET;



export const handler = async (event) => {


    // Create connection pool
    const pool = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true
    })

    // Helper function to fetch and format auctions
    const fetchUserAuctions = () => {
        return new Promise((resolve, reject) => {
            pool.query(`
    SELECT 
        a.auction_id,
        a.start_time,
        a.end_time,
        a.starting_bid, 
        u.user_id as seller_id,
        u.username as seller_name,
        a.status,
        ai.auction_item_id as item_id,
        ai.item_name as item_name,
        ai.information as item_information,
        ur.timestamp as unfreeze_request_timestamp,
        ur.description as unfreeze_request_description
      FROM auctions a
      LEFT JOIN users AS u ON a.seller_id = u.user_id
      LEFT JOIN auction_items AS ai ON a.item_id = ai.auction_item_id
      LEFT JOIN unfreeze_requests AS ur ON a.auction_id = ur.auction_id
    `, [], (error, rows) => {
                if (error) {
                    return reject(error)
                }


                // Group items by status directly in the database callback
                const result = {
                    unlisted: [],
                    active: [],
                    failed: [],
                    bought: [],
                    archived: [],
                    frozen: []
                }

                rows.forEach(row => {
                    const status = row.status.toLowerCase()
                    if (result.hasOwnProperty(status)) {
                        result[status].push({
                            auction_id: row.auction_id,
                            item_id: row.item_id,
                            item_name: row.item_name,
                            item_seller_id: row.seller_id,
                            item_seller: row.seller_name,
                            item_starting_price: row.starting_bid,
                            item_start_time: row.start_time,
                            item_end_time: row.end_time,
                            item_information: row.item_information,
                            unfreeze_request_timestamp: row.unfreeze_request_timestamp,
                            unfreeze_request_description: row.unfreeze_request_description


                        })
                    }
                })

                resolve(result)
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

    let token;
    try {
        let auth = event.token

        token = auth.split(" ")[1];

    } catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "No token" })
        };
    }

    try {
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




    try {

        const groupedAuctions = await fetchUserAuctions()
        pool.close()



        return {
            statusCode: 200,
            body: groupedAuctions
        }

    } catch (error) {
        console.error('Error:', error)
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Failed to fetch auctions' })
        }
    } finally {
        pool.close()
    }
}