import AuctionItem from "../entitites/AuctionItem";

export default function AuctionItemClickable({aucItem}: {aucItem: AuctionItem}){
    return(
        <div>
            <p>item id: {aucItem.getAIId()}</p>
            <p>item name: {aucItem.getIN()}</p>
            <p>item info: {aucItem.getInfo()}</p>
        </div>
    )
}