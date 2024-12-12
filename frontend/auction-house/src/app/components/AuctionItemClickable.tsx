import { AuctionItem } from "../search/page"

export default function AuctionItemClickable({ aucItem }: { aucItem: AuctionItem }) {
    return (
        <div className="h-full flex gap-8 bg-gray-100">
            <div>
                {aucItem.status == 'active' &&
                    <h1 className="text-green-700 ">status: {aucItem.status}</h1>
                }
                {(aucItem.status == 'bought' || aucItem.status == 'archived') &&
                    <h1 className="text-red-700 "> status: {aucItem.status}</h1>
                }

                <p className="text-black">item name: {aucItem.item_name}</p>
                <p className="text-black">current price: ${aucItem.amount}</p>
                <p className="text-black ">item info: {aucItem.information}</p>
            </div>
            {aucItem.picture && (
                <div className="ml-auto">
                    <img
                        src={aucItem.picture}
                        alt="Preview"
                        className="w-32 h-32 object-contain mt-2"
                    />
                </div>
            )}
        </div>
    )
}