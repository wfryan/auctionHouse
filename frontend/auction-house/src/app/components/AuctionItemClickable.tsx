import { AuctionItem } from "../search/page"

export default function AuctionItemClickable({aucItem}: {aucItem: AuctionItem}){
    return(
        <div>
            <p>item id: {aucItem.auction_item_id}</p>
            <p>item name: {aucItem.item_name}</p>
            <p>item info: {aucItem.information}</p>
        </div>
    )
}