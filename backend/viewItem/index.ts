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
    const [searchedItem] = await connection.query('SELECT * FROM auctions WHERE item_id=?', [event.id])

    console.log(searchedItem[0])

    return {
      statusCode: 200,
      body: {success: true, item: searchedItem[0]}
    }
  }catch (error){
    return {statusCode: 500, body: JSON.stringify({success: false, message: "internal server error"})}
  }finally{
    await connection.end()
  }
};