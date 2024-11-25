'use client'
import { useState, useRef, useEffect } from "react"
import AuctionItemClickable from "@/app/components/AuctionItemClickable"
import { useRouter, useSearchParams } from 'next/navigation'
import { instance } from '../utils/auctionHouseApi';
import { removeToken } from "../utils/cookie"
import SignOutButton from "../components/SignoutButton"

import StatDisplay from "../components/StatDisplay"

export interface AuctionItem {
    auction_item_id: number
    item_name: string
    information: string
}

export default function Search() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const user = searchParams?.get("username")
    const [userInfo, setUserInfo] = useState({ balance: 0 })
    const [auctions, setAuctions] = useState<AuctionItem[]>([])
    const [dispError, setDispError] = useState(false)
    const input = useRef<HTMLInputElement>(null)
    useEffect(() => {
        pullUserInfo()
    }, [])

    const pullUserInfo = async () => {
        const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/users/viewUserFunds", {
            method: "POST",
            body: JSON.stringify({ username: user })
        })
        const jsonResp = await resp.json()
        setUserInfo(jsonResp.body.user)
    }

    const searchFunc = async () => {
        try {
            if (input.current == null) {
                throw (new Error("error"))
            }
            const body = {
                search: input.current.value
            }





            const resp = await instance.post("items/searchItems", JSON.stringify(body));
            setAuctions(resp.data.items)
        }
        catch (error) {
            setDispError(true)
            console.log(error)
        }
    }

    const setStorage = async (itemId: number) => {
        localStorage.setItem("id", itemId.toString())
        router.push("/auction_page?username=" + user)
    }

    const handleSignupClick = () => {
        router.push("/login")
    };


    return (
        <div>
            <StatDisplay bal={userInfo.balance}></StatDisplay>
            <br></br>
            <button onClick={handleSignupClick}>Login/Sign up</button>
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