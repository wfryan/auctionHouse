import mysql from 'mysql2/promise'

export const handler = async (event) => {
  let connection;
  try{
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })
    const [searchedItems] = await connection.query(
      'SELECT * FROM auction_items INNER JOIN auctions ON auction_items.auction_item_id = auctions.item_id WHERE auction_items.item_name LIKE CONCAT ("%", ?, "%") AND auctions.status !=?', [event.search, "unlisted"])

    console.log(searchedItems)

    return {
      statusCode: 200,
      body: {success: true, items: searchedItems}
    }
  }catch (error){
    return {statusCode: 500, body: JSON.stringify({success: false, message: "internal server error"})}
  }finally{
    await connection.end()
  }
