import mysql from 'mysql2'

export const handler = async (event, context) => {

    let connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    //attempts to add an auction item, gets its id if successful
    let AddImageURL = (id, imageName) => {
        if (imageName == null) {
            return false;
        }

        return new Promise((resolve, reject) => {
            const sql = "UPDATE auction_items SET picture=? WHERE auction_item_id=?";
            connection.query(sql, [imageName, id], (error, result) => {
                if (error) { return reject(error); }
                else { return resolve(true) };
            })
        })
    }

    try {

        const url_added = await AddImageURL(event.auctionItemId, event.imageURL);
    } catch (error) {
        return {
            statusCode: 400,
            message: error
        }
    }

    return {
        statusCode: 200,
        message: "database changed"
    }
};
