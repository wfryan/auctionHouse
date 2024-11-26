import { Bid } from "../auction_page/page";

export default function BidDisplay({bid}: {bid: Bid}){
    return(
        <div>
            <p>User: {bid.username}</p>
            <p>Amount: {bid.amount}</p>
            <p>Time: {bid.bidTime.toString()}</p>
        </div>
    )
}