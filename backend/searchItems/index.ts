import mysql from 'mysql2/promise'

export const handler = async (event) => {
  let connection;
  try{
    connection = await mysql.createConnection({
      host: "auctionhouse.c32su8ym6ttr.us-east-2.rds.amazonaws.com",
      user: "admin",
      password: "auctionHouse!",
      database: "auction_house",
      port: 3306
    })
    const [searchedItems] = await connection.query('SELECT * FROM auction_items WHERE item_name LIKE CONCAT ("%", ?, "%")', [event.search])

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
};
