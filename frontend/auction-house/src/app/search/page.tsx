'use client'
import { useState, useRef, useEffect } from "react"
import AuctionItemClickable from "@/app/components/AuctionItemClickable"
import AuctionItem from "@/app/entitites/AuctionItem"
import { useRouter } from 'next/navigation'
import { instance } from '../utils/auctionHouseApi';
import { removeToken } from "../utils/cookie"
import SignOutButton from "../components/SignoutButton"


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


            const resp = await instance.post("items/searchItems", JSON.stringify(body));

            const tmpArray: AuctionItem[] = []
            let curItem;
            for (let i = 0; i < resp.data.body.items.length; i++) {
                curItem = resp.data.body.items[i]
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
                <SignOutButton/>
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