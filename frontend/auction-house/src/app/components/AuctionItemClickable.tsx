import AuctionItem from "../entitites/AuctionItem";

export default function AuctionItemClickable({aucItem}: {aucItem: AuctionItem}){
    return(
        <div>
            <p>{aucItem.getAII()}</p>
            <p>{aucItem.getIN()}</p>
            <p>{aucItem.getInfo()}</p>
        </div>
    )
}