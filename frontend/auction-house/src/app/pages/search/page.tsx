'use client'
import { useState, useRef } from "react"
import AuctionItemClickable from "@/app/components/AuctionItemClickable"
import AuctionItem from "@/app/entitites/AuctionItem"
import Link from "next/link"
export default function Search() {
    const [auctions, setAuctions] = useState<AuctionItem[]>([])
    const [dispError, setDispError] = useState(false)
    const input = useRef<HTMLInputElement>(null)
    const searchFunc = async () => {
        try {
            if (input.current == null) {
                throw (new Error("error"))
            }
            const body = {
                search: input.current.value
            }

            const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/items/searchItems", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })

            const awaitResp = await resp
            const jsonResp = await awaitResp.json()
            console.log(jsonResp)
            const tmpArray: AuctionItem[] = []
            let curItem;
            for (let i = 0; i < jsonResp.body.items.length; i++) {
                curItem = jsonResp.body.items[i]
                tmpArray.push(new AuctionItem(curItem.auction_item_id, curItem.item_name, curItem.information == null ? "" : curItem.information, curItem.picture == null ? "" : curItem.picture))
            }
            //set auctions
            console.log(tmpArray)
            setAuctions(tmpArray)
        }
        catch (error) {
            setDispError(true)
            console.log(error)
        }
    }

    const setStorage = async (itemId: number, itemName: string, itemInfo: string, itemPic: File) => {
        localStorage.setItem("id", itemId.toString())
        localStorage.setItem("name", itemName)
        localStorage.setItem("info", itemInfo)

        const reader = new FileReader()
        reader.readAsArrayBuffer(itemPic);
        //NOTE: this should include error checking

        let uint8Array = null;
        try {
            if (reader.result instanceof ArrayBuffer) {
                uint8Array = new Uint8Array(reader.result);

            }
        } catch {
            console.log(new Error("Failed to read file as ArrayBuffer"))
        }
        let blob = null;
        if (uint8Array != null) {
            blob = new Blob([uint8Array], { type: "application/octet-stream" })

            reader.onloadend = () => {
                if (typeof reader.result == 'string') {
                    localStorage.setItem("img", reader.result)
                }
            }
            reader.readAsDataURL(blob)
        }



    }

    const handleSignupClick = () => {
        window.location.href = '/pages/login';
    };


    return (
        <div>
            <div>
                <br></br>
                <button onClick={handleSignupClick}>Login/Sign up</button>
                <br></br><br></br><br></br>
            </div>
            <input placeholder="Search..." ref={input} id="srchbar" /><button onClick={() => searchFunc()}>Search Items</button>
            {
                auctions.map(auction => {
                    return (
                        <div key={auction.getAIId()}>
                            <Link onClick={() => setStorage(auction.getAIId(), auction.getIN(), auction.getInfo(), auction.getPicture())} href={`./${auction.getAIId()}`}>
                                <AuctionItemClickable aucItem={auction}></AuctionItemClickable>
                            </Link>
                        </div>

                    )
                })
            }
            {
                dispError &&
                <p>There was an error retrieving the auction items</p>
            }
        </div >
    )
}