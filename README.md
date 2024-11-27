# Auction House Group Project

## Main Link [Heres the link](https://auction-house-group-java.s3.us-east-2.amazonaws.com/index.html)

---------------------
## Iteration 2 Use Cases

- Buyer Add Funds
- Buyer Close Account
- Place Bids
- Review Active Bids
- Seller Close Account
- Edit Auction/Item
- Unpublish
- Freeze Auction
- Unfreeze Auction
- Request Item Unfreeze
- Buy Now
- Fulfill Auction

## Iteration 2 Refactors

- Persistent Login sessions
- Images moved from db to s3 bucket
- JWT Authentication tokens
- Dynamic routing

## URLS
- ../login
- ../signup
- ../auction_dashboard
- ../buyer_dashboard
- ../admin_dashboard
- ../buyer_profile
- ../seller_profile
- ../create_auction
- ../search
- ../auction_item


## Backup Run auctionHouse

- initialize npm in frontend/auction-house through npm install
- npm run dev


---------------------
## Iteration 1 Use Cases

- Search Items
- View Item
- Create Account
- Buyer Login
- Seller Login
- Create Item
- Review Item
- Publish Item

## Run auctionHouse

- initialize npm in frontend/auction-house through npm install
- npm run dev

## URLs

- .../pages/login
- .../pages/signup
- .../pages/auction_dashboard?username={seller_username}
- .../pages/seller_profile?username={seller_username}
- .../pages/create_auction?username={seller_username}
- .../pages/search?username={buyer_username}
- .../pages/{item_id}
