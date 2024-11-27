import mysql from 'mysql2/promise'

function formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const hour = date.getHours().toString().padStart(2, "0")
    const minute = date.getMinutes().toString().padStart(2, "0")
    const second = date.getSeconds().toString().padStart(2, "0")

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export const handler = async (event) => {
    let connection
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        })
        const [auction] = await connection.query("SELECT * FROM auctions WHERE auction_id = ?", [event.auction_id])
        const [bids] = await connection.query("SELECT bids.*, users.username FROM bids JOIN users ON bids.buyer_id = users.user_id WHERE bids.auction_id = ? ORDER BY bids.amount DESC", [event.auction_id])
        let [user] = await connection.query("SELECT user_id, balance, account_type, is_active FROM users WHERE user_id = ?", [event.buyer_id])
        const highestBid = auction[0].highest_bid == null ? auction[0].starting_bid : bids[0].amount
        const [tmpUsedFunds] = await connection.query("SELECT COALESCE(SUM(bids.amount), 0) AS total FROM bids JOIN auctions ON bids.bid_id = auctions.highest_bid WHERE bids.buyer_id = ? AND (auctions.status = ? OR auctions.status = ?)", [event.buyer_id, "active", "bought"]) //gets total amount used where user has the highest bid 
        console.log("tmp used funds: " + tmpUsedFunds[0].total)
        user[0].tmpUsedFunds = tmpUsedFunds[0].total
        console.log("prereqs gotten")
        const formattedEndTime = formatDate(auction[0].end_time)
        console.log(formattedEndTime)
        console.log(event.bidTime)
        const formattedStartTime = formatDate(auction[0].start_time)
        auction[0].start_time = formattedStartTime
        auction[0].end_time = formattedEndTime
        if (event.bidTime > formattedEndTime) { //if bid time past end time of auction
            let updated = auction
            if (auction[0].status == "active" && auction[0].highest_bid != null) { //if there is a winning bid
                await connection.query("UPDATE auctions SET status = ?, winner_id = ? WHERE auction_id = ?", ["bought", bids[0].buyer_id, event.auction_id]) //change status to bought and set winner id
                const [updatedBoughtAuction] = await connection.query("SELECT * FROM auctions WHERE auction_id = ?", [event.auction_id])
                updated = updatedBoughtAuction
            }
            else if (auction[0].status == "active" && auction[0].highest_bid == null) { //if there was no bid placed
                await connection.query("UPDATE auctions SET status = ? WHERE auction_id = ?", ["unlisted", event.auction_id]) //change status to unlisted (no bid placed)
                const [updatedUnlistedAuction] = await connection.query("SELECT * FROM auctions WHERE auction_id = ?", [event.auction_id])
                updated = updatedUnlistedAuction
            }
            updated[0].start_time = formatDate(updated[0].start_time)
            updated[0].end_time = formatDate(updated[0].end_time)
            return {
                statusCode: 400,
                body: { message: "Auction has expired", item: updated[0], bids: bids, user: user[0] }
            }
        }
        else if (event.bidTime < formattedStartTime) {
            return {
                statusCode: 400,
                body: { message: "Auction has not started", item: auction[0], bids: bids, user: user[0] }
            }
        }
        else if (highestBid > event.amount) { //if higher bid has been placed in meantime
            return {
                statusCode: 400,
                body: { message: "A higher bid has been placed", item: auction[0], bids: bids, user: user[0] }
            }
        }
        else if (bids.length != 0 && bids[0].buyer_id == event.buyer_id) { //if same user is bidding on item they have the highest bid on
            return {
                statusCode: 400,
                body: { message: "You cannot place a bid on an item you have the highest bid on", item: auction[0], bids: bids, user: user[0] }
            }
        }
        else if (user[0].balance < event.amount || (user[0].balance - tmpUsedFunds[0].total) < event.amount) { //not enough funds
            return {
                statusCode: 400,
                body: { message: "You do not have enough funds to make this bid", item: auction[0], bids: bids, user: user[0] }
            }
        }
        else { //if valid bid
            console.log("valid")
            const [max] = await connection.query("SELECT MAX(bid_id) AS maxId FROM bids")
            const newId = (max[0].maxId || 0) + 1
            await connection.query("INSERT INTO bids (bid_id, auction_id, buyer_id, amount, bidTime) VALUES (?, ?, ?, ?, ?)", [newId, event.auction_id, event.buyer_id, event.amount, event.bidTime])
            let [newBid] = await connection.query("SELECT bids.*, users.username FROM bids JOIN users ON bids.buyer_id = users.user_id WHERE bids.bid_id = ?", [newId])
            let [updatedUser] = await connection.query("SELECT user_id, balance, account_type, is_active FROM users WHERE user_id = ?", [event.buyer_id])
            const updatedTmpUsedFunds = parseInt(tmpUsedFunds[0].total) + parseInt(event.amount)
            console.log("updated tmp used funds: " + updatedTmpUsedFunds)
            updatedUser[0].tmpUsedFunds = updatedTmpUsedFunds
            await connection.query("UPDATE auctions SET highest_bid = ? WHERE auction_id = ?", [newId, event.auction_id])
            const [updatedAuction] = await connection.query("SELECT * FROM auctions WHERE auction_id = ?", [event.auction_id])
            updatedAuction[0].start_time = formatDate(updatedAuction[0].start_time)
            updatedAuction[0].end_time = formatDate(updatedAuction[0].end_time)
            console.log(newBid)
            bids.unshift(newBid[0])
            return {
                statusCode: 200,
                body: { message: "Bid placed successfully", item: updatedAuction[0], bids: bids, user: updatedUser[0] }
            }
        }

    } catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: { message: error }
        }
    }
};
