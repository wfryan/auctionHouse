'use client'
import { useState, useRef, useEffect } from "react"
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

    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter()
    const [auctions, setAuctions] = useState<AuctionItem[]>([])
    const [dispError, setDispError] = useState(false)
    const input = useRef<HTMLInputElement>(null)


    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

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
        <div className="min-h-screen py-8 px-4">
            {/* Conditionally render BuyerInfo, LoginButton, and SignOutButton */}
            {isMounted && getToken() != null && <BuyerInfo />}
            <div className="mt-4">
                {isMounted && <LoginButton />}
                {isMounted && <SignOutButton />}
            </div>

            {/* Search bar section */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <input
                    placeholder="Search for auction items..."
                    ref={input}
                    id="srchbar"
                    className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 text-black focus:ring-blue-500 focus:outline-none w-full sm:w-80"
                />
                <button
                    onClick={() => searchFunc()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    Search Items
                </button>
            </div>

            {/* Auctions section */}
            <div className="mt-6 grid grid-cols-1 gap-6">
                {auctions.map((item) => (
                    <div key={item.auction_item_id} className="p-4 bg-white rounded-lg shadow-md w-30 hover:shadow-xl transition-shadow duration-300">
                        <div onClick={() => setStorage(item.auction_item_id)}>
                            <AuctionItemClickable aucItem={item} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Error message */}
            {dispError && (
                <p className="mt-4 text-red-600 font-semibold">
                    There was an error retrieving the auction items.
                </p>
            )}
        </div>
    );

}