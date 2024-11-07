import mysql from 'mysql2'

export const handler = async (event) => {

  let pool = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
let publishAuction = (auId) => {
  let queryStr = "UPDATE auctions SET status=? WHERE auction_id=?"
  return new Promise((resolve, reject) => {
    pool.query(queryStr, ['active', auId], (error, rows)=>{
      if(error){return reject(error)}
      else{
        return resolve(true)
      }
    })
  })
}

let auctionId = event.auctionId;
console.log(event)
const updatedAuction = await publishAuction(auctionId);
pool.close();
let response;
if(updatedAuction!== null && updatedAuction){
  response = {
    statusCode: 200,
    body:"Publish successful"
  }
}
else{
  response ={
    statusCode:400,
    body:"Publish failed"
  }
}
  return response;
};
