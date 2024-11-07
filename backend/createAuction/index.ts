import mysql from 'mysql2'

export const handler = async (event) => {
    //connect to database
    let connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    //finds if the user exists, gets its id if so
    let CheckIdentity = (username) => {
        let name = String(username);
        return new Promise((resolve, reject) => {
            connection.query('SELECT user_id FROM users WHERE username=?',
                [username], (error, result) => {
                    if (error) { return reject(error); }
                    else { return resolve(result) };
                })
        })
    }

    //attempts to add an auction item, gets its id if successful
    let CreateAuctionItem = (itemName, itemDescription, image) => {
        let item_name = String(itemName)
        let buffer = null;
        if (image) {
            buffer = Buffer.from(image, 'base64')
        }

        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO auction_items (item_name, information, picture) VALUES (?, ?, ?)";
            connection.query(sql, [item_name, itemDescription, buffer], (error, result) => {
                if (error) { return reject(error); }
                else { return resolve({ id: result.insertId }) };
            })
        })
    }

    //tries to parse images
    let ImageParser = (image) => {
        if (image == null) { return true; }
        else { return false } //NOT COMPLETE

    }

    //creates auction item
    let CreateAuction = (seller_id, auctionItemId, startingPrice, startTime, endTime) => {
        //handle if date/time are invalid
        if (startTime != null) {
            startTime = new Date(startTime);
        }
        if (endTime != null) {
            endTime = new Date(endTime);
        }


        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO auctions (item_id, seller_id, starting_bid, status, start_time, end_time) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
            connection.query(sql, [auctionItemId, seller_id, startingPrice, 'unlisted', startTime, endTime], (error, result) => {
                if (error) { return reject(error); }
                else { return resolve(result) };
            })
        })


    }



    const identity = await CheckIdentity(event.username);

    if (identity.length != 1) {
        let response = {
            statusCode: 400,
            body: "Invalid user"
        }
        return response;
    }



    const id_added = await CreateAuctionItem(event.itemName, event.itemDescription, event.image);


    const auction_created = await CreateAuction(identity[0].user_id, id_added.id, event.startingPrice, event.startTime, event.endTime);
    connection.close();

    let response = {
        statusCode: 200,
        body: "Item added"

    }
    return response;

};