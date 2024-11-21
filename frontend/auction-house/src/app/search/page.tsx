'use client'
import { useState, useRef, useEffect } from "react"
import AuctionItemClickable from "@/app/components/AuctionItemClickable"
import AuctionItem from "@/app/entitites/AuctionItem"
import { useRouter, useSearchParams } from 'next/navigation'
export default function Search() {
    interface ImageResponse {
        data: number[],
        type: string
    }
    const router = useRouter()
    const searchParams = useSearchParams()
    const user = searchParams?.get("username")
    const [auctions, setAuctions] = useState<AuctionItem[]>([])
    const [dispError, setDispError] = useState(false)
    const input = useRef<HTMLInputElement>(null)
    useEffect(() => {
        //*TODO: Paginate this page to load first 20 auctions on page load and get total number of pages*/
    }, [])
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

    const setStorage = async (itemId: number, itemName: string, itemInfo: string, itemPic: ImageResponse) => {
        localStorage.setItem("id", itemId.toString())
        localStorage.setItem("name", itemName)
        localStorage.setItem("info", itemInfo)

        const reader = new FileReader()
        const dataArray = new Uint8Array(itemPic.data)
        const blob = new Blob([dataArray], { type: "application/octet-stream" })
        reader.onloadend = () => {
            if (typeof reader.result == 'string') {
                localStorage.setItem("img", reader.result)
            }
        }
        reader.readAsDataURL(blob)
        console.log("page: " + localStorage.getItem("img"))
        router.push("/item")
    }

    const handleSignupClick = () => {
        router.push("/login")
    };

    return (
        <div>
            <div>
                <br></br>
                <button onClick={handleSignupClick}>Login/Sign up</button>
                <br></br><br></br><br></br>
            </div>
            <input placeholder="Search..." ref={input} id="srchbar" /><button onClick={() => searchFunc()}>Search Items</button>
            <button onClick={() => { router.push(`/buyer_profile?username=${user}`) }}>{user}</button>
            {
                auctions.map(auction => {
                    return (
                        <div key={auction.getAIId()}>
                            <div onClick={() => setStorage(auction.getAIId(), auction.getIN(), auction.getInfo(), auction.getPicture())}>
                                <AuctionItemClickable aucItem={auction}></AuctionItemClickable>
                            </div>
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