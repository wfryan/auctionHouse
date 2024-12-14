import mysql from 'mysql2';
import jwt from 'jsonwebtoken';

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper function to verify JWT token
const verifyToken = (auth) => {
    try {
        jwt.verify(auth, process.env.JWT_SECRET);
        return true;
    } catch (error) {
        return false;
    }
};

// Function to execute queries
const executeQuery = (query) => {
    return new Promise((resolve, reject) => {
        pool.query(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to get auction data and total row count
const getResultsAndCount = async () => {
    const query = `
    SELECT
    ai.item_name,
    wb.amount AS sold_price,
    wu.username AS buyer_username
    FROM
        auction_items ai
    JOIN
        auctions auc ON ai.auction_item_id = auc.item_id
    LEFT JOIN
        bids wb ON auc.winner_id = wb.bid_id -- Join to get the winning bid details
    LEFT JOIN
        users wu ON wb.buyer_id = wu.user_id -- Join to get the winner's user information
    WHERE
        auc.status IN ('bought', 'archived') -- Fetch items with status 'bought' or 'archived'
        AND auc.winner_id IS NOT NULL; -- Ensure there is a winning bid associated
  `;

    const countQuery = `
    SELECT COUNT(*) AS totalRows
    FROM
      auction_items ai
    JOIN
        auctions auc ON ai.auction_item_id = auc.item_id
    LEFT JOIN
        bids wb ON auc.winner_id = wb.bid_id -- Join to get the winning bid details
    LEFT JOIN
        users wu ON wb.buyer_id = wu.user_id -- Join to get the winner's user information
    WHERE
        auc.status IN ('bought', 'archived') -- Fetch items with status 'bought' or 'archived'
        AND auc.winner_id IS NOT NULL; -- Ensure there is a winning bid associated
  `;

    // Execute both queries in parallel
    const [results, totalRows] = await Promise.all([
        executeQuery(query),
        executeQuery(countQuery).then((rows) => rows[0].totalRows)
    ]);

    return { results, totalRows };
};

export const handler = async (event) => {
    try {
        console.log('Received event:', event);

        // Assuming token is passed as "Bearer <token>"
        const auth = event.token;
        if (!auth || !verifyToken(auth)) {
            return {
                statusCode: 418,
                body: JSON.stringify({ message: 'Invalid or missing token' })
            };
        }

        // Get results and total row count
        const { results, totalRows } = await getResultsAndCount();

        // Return the data and total row count
        return {
            statusCode: 200,
            body: JSON.stringify({
                data: results,
                totalRows: totalRows,  // Include total number of rows in the response
            }),
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
