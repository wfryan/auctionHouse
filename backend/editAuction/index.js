import mysql from 'mysql2';
import jwt from 'jsonwebtoken'



export const handler = async (event) => {

    // Create connection pool
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    // Define S3 Bucket info
    const bucketName = "auction-house-group-java";
    const url = `https://${bucketName}.s3.amazonaws.com/images/`;

    // Helper function to verify JWT token
    const verifyToken = (auth) => {
        try {
            jwt.verify(auth, process.env.JWT_SECRET);
            return true;
        } catch (error) {
            return false;
        }
    };

    // Helper function to validate and update auction
    const updateAuction = ({ username, auctionId, itemName, itemDescription, startingPrice, startTime, endTime, auctionType, imageURL }) => {
        return new Promise((resolve, reject) => {
            pool.getConnection(async (err, connection) => {
                if (err) return reject(err);

                try {
                    const [userRows] = await connection.promise().query(
                        'SELECT * FROM users WHERE username = ?',
                        [username]
                    );

                    if (userRows.length === 0) {
                        return reject({ status: 403, message: 'User does not exist' });
                    }

                    const userId = userRows[0].user_id;

                    const [auctionRows] = await connection.promise().query(
                        'SELECT * FROM auctions WHERE auction_id = ? AND seller_id = ?',
                        [auctionId, userId]
                    );

                    if (auctionRows.length === 0) {
                        return reject({ status: 403, message: 'Auction not found or not owned by user' });
                    }

                    const itemId = auctionRows[0].item_id;

                    // If imageURL is provided as an image name, construct the full URL
                    if (imageURL && !imageURL.startsWith('https://')) {
                        imageURL = `${url}${itemId}${imageURL}`;
                    }

                    await connection.promise().query(
                        'UPDATE auction_items SET item_name = ?, information = ?, picture = ? WHERE auction_item_id = ?',
                        [itemName, itemDescription, imageURL, itemId]
                    );

                    await connection.promise().query(
                        'UPDATE auctions SET starting_bid = ?, start_time = ?, end_time = ?, isBuyNow = ? WHERE auction_id = ?',
                        [startingPrice, startTime, endTime, auctionType, auctionId]
                    );

                    resolve({ auction_item_id: itemId, message: 'Auction updated successfully' });
                } catch (queryError) {
                    reject(queryError);
                } finally {
                    connection.release();
                }
            });
        });
    };
    try {
        console.log('Received event:', event);

        const username = event.username;
        const auctionId = event.auctionId;
        const itemName = event.itemName;
        const startingPrice = event.startingPrice;
        const startTime = event.startTime;
        const endTime = event.endTime;
        const itemDescription = event.itemDescription;
        const auctionType = event.auctionType;
        const imageURL = event.imageURL;

        /*
        const auth = event.token.split(" ")[1]; // Bearer <token>
        
        if (!verifyToken(auth)) {
          return {
            statusCode: 418,
            body: JSON.stringify({ message: 'Invalid token' })
          };
        }
        */

        if (!username || !auctionId || !itemName || startingPrice == null || !startTime || !endTime || auctionType == null) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "missing required fields" }),
            };
        }

        const result = await updateAuction({
            username,
            auctionId,
            itemName,
            itemDescription,
            startingPrice,
            startTime,
            endTime,
            auctionType,
            imageURL
        });

        if (event.imageURL !== null) {
            return {
                statusCode: 200,
                imageAdded: true,
                body: JSON.stringify(result),
            };
        } else {
            return {
                statusCode: 200,
                imageAdded: false,
                body: JSON.stringify(result),
            };
        }

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
