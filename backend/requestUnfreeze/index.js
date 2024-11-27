import mysql from 'mysql2';
import jwt from 'jsonwebtoken'

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper function to insert unfreeze request
const insertUnfreezeRequest = ({ auctionId, description, date }) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(async (err, connection) => {
            if (err) return reject(err);

            try {
                // Query to check if the unfreeze request already exists for this auction_id
                const [existingRequest] = await connection.promise().query(
                    'SELECT * FROM unfreeze_requests WHERE auction_id = ?',
                    [auctionId]
                );

                if (existingRequest.length > 0) {
                    return reject({ status: 400, message: 'Request has already been made for this auction' });
                }

                // Query to get the seller_id from the auctions table
                const [auctionRows] = await connection.promise().query(
                    'SELECT seller_id FROM auctions WHERE auction_id = ?',
                    [auctionId]
                );

                if (auctionRows.length === 0) {
                    return reject({ status: 404, message: 'Auction not found' });
                }

                const sellerId = auctionRows[0].seller_id;

                // Insert unfreeze request into the unfreeze_request table
                await connection.promise().query(
                    'INSERT INTO unfreeze_requests (auction_id, seller_id, description, timestamp) VALUES (?, ?, ?, ?)',
                    [auctionId, sellerId, description, date]
                );

                resolve({ message: 'Unfreeze request submitted successfully' });
            } catch (queryError) {
                reject(queryError);
            } finally {
                connection.release();
            }
        });
    });
};

// Helper function to verify JWT token
const verifyToken = (auth) => {
    try {
        jwt.verify(auth, process.env.JWT_SECRET);
        return true;
    } catch (error) {
        return false;
    }
};

export const handler = async (event) => {
    try {
        console.log('Received event:', event);

        // Extract token from headers and verify
        const auth = event.token.split(" ")[1]; // Bearer <token>
        if (!verifyToken(auth)) {
            return {
                statusCode: 418,
                body: JSON.stringify({ message: 'Invalid token' })
            };
        }

        // Extract required fields from the event body
        const auctionId = event.auctionId;
        const description = event.reason;
        const date = event.date;

        if (!auctionId || !description || !date) {
            return {
                statusCode: 402,
                body: JSON.stringify({ error: 'Missing required fields (auctionId, description)' }),
            };
        }

        // Insert the unfreeze request
        const result = await insertUnfreezeRequest({ auctionId, description, date });

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: error.status || 500,
            body: JSON.stringify({
                error: error.message || 'Unexpected error occurred',
            }),
        };
    }
};
