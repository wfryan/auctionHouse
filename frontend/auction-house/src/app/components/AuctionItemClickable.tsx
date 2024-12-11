import { AuctionItem } from "../search/page"

export default function AuctionItemClickable({ aucItem }: { aucItem: AuctionItem }) {
    return (
        <div>
            <p className="text-black">item id: {aucItem.auction_item_id}</p>
            <p className="text-black">item name: {aucItem.item_name}</p>
            <p className="text-black">item info: {aucItem.information}</p>
        </div>
    )
}