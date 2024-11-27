'use client'
import { useState, useRef } from "react"
import AuctionItemClickable from "@/app/components/AuctionItemClickable"
import { useRouter } from 'next/navigation'
import BuyerInfo from "../components/BuyerInfo"
import SignOutButton from "../components/SignoutButton"
import { getToken } from "../utils/cookie"
import LoginButton from "../components/LoginButton"

export interface AuctionItem {
    auction_item_id: number
    item_name: string
    information: string
}

export default function Search() {
    const router = useRouter()
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
            const jsonResp = await resp.json()
            console.log(jsonResp)
            setAuctions(jsonResp.body.items)
        }
        catch (error) {
            setDispError(true)
            console.log(error)
        }
    }

    const setStorage = async (itemId: number) => {
        localStorage.setItem("id", itemId.toString())
        router.push("/auction_page")
    }


    return (
        <div>
            {getToken() != null && <BuyerInfo />}
            <br></br>
            <LoginButton />
            <SignOutButton />
            <br></br><br></br><br></br>
            <input placeholder="Search..." ref={input} id="srchbar" /><button onClick={() => searchFunc()}>Search Items</button>
            {
                auctions.map(item => {
                    return (
                        <div key={item.auction_item_id}>
                            <div onClick={() => setStorage(item.auction_item_id)}>
                                <AuctionItemClickable aucItem={item}></AuctionItemClickable>
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