import { Bid } from "../auction_page/page";

export default function BidDisplay({bid}: {bid: Bid}){
    const formatBidTime = (time: string) => {
        const tmp = time.split(/[T.]/)
        return `${tmp[0]} ${tmp[1]}`
    }
    const formattedTime = formatBidTime(bid.bidTime.toString())

    return(
        <div>
            <p>User: {bid.username}</p>
            <p>Amount: {bid.amount}</p>
            <p>Time: {formattedTime}</p>
        </div>
    )
}