'use client'
import { useEffect, useState } from "react"
import BidDisplay from "../components/BidDisplay"
import StatDisplay from "../components/StatDisplay"
import { useRouter, useSearchParams } from "next/navigation"

export interface Bid{ //export needed in BidDisplay
    bid_id: number,
    auction_id: number,
    buyer_id: number,
    amount: number,
    bidTime: Date,
    username: string,
}

export default function AuctionPage() {
    interface Auction{
        auction_id: number
        item_name: string
        information: string
        seller_id: number
        starting_bid: number
        highest_bid: number //id of highest bid
        status: string
        start_time: string
        end_time: string
        winner_id: number
    }

    const router = useRouter()
    const searchParams = useSearchParams()
    const user = searchParams?.get("username")
    const [userData, setUserData] = useState({balance: 0, user_id: 0})
    const [auction, setAuction] = useState<Auction | null>(null)
    const [bids, setBids] = useState<Bid[]>([])
    const [dispError, setDispError] = useState(false) //error unused atm
    const displayImage = (imgElement: HTMLImageElement) => {
        const dataUrl = localStorage.getItem("img")
        if (dataUrl) {
            imgElement.src = dataUrl
        }
    }
    
    const formatTime = (date: Date) => {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const day = date.getDate().toString().padStart(2, "0")
        const hour = date.getHours().toString().padStart(2, "0")
        const minute = date.getMinutes().toString().padStart(2, "0")
        const second = date.getSeconds().toString().padStart(2, "0")
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }
    
    const fetchData = async () => {
        try {
            console.log(localStorage.getItem("id"))
            const body = {
                id: localStorage.getItem("id"),
                username: user
            }
            const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/items/viewItem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            const awaitRespJson = await resp.json()
            console.log(awaitRespJson)
            const jsonItemResp = awaitRespJson.body.item
            const jsonAuctionBids = awaitRespJson.body.bids
            console.log(jsonItemResp)
            console.log(jsonAuctionBids)
            setAuction(jsonItemResp)
            setBids(jsonAuctionBids)
            setUserData(awaitRespJson.body.user)
            console.log(userData)
        } catch (error) {
            setDispError(true)
            console.log(error)
            console.log(dispError)
        }
    }

    useEffect(() => {
        fetchData()
        console.log(userData)
    }, [])

    /**TODO: ?: page should refresh every 30 seconds or so correct? to refresh bids. */

    const placeBidFunction = async () => {
        console.log(userData.user_id)
        const bidValue = (document.getElementById("bidInput") as HTMLInputElement).value
        console.log(parseInt(bidValue))
        console.log(auction?.auction_id)
        console.log(formatTime(new Date()))
        try{
            console.log(bids)
            if(bids.length == 0 && auction != null){
                if(bidValue == "" || parseInt(bidValue) < auction?.starting_bid){
                    throw new Error("there was an error")
                }
            }
            else{
                if(bidValue == "" || parseInt(bidValue) < bids[0].amount){
                    throw new Error("there was an error")
                }
            }
            const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/auction/placeBid", {
                method: "POST",
                body: JSON.stringify({
                    amount: parseInt(bidValue),
                    auction_id: auction?.auction_id,
                    buyer_id: userData.user_id,
                    bidTime: formatTime(new Date())
                })
            })
            const respJson = await resp.json()
            console.log(respJson)
            setAuction(respJson.body.item)
            setBids(respJson.body.bids)
            setUserData(respJson.body.user)
        }
        catch(error){
            console.log(error)
        }
    }

    return (
        <div>
            <StatDisplay bal = {userData.balance}></StatDisplay>
            {auction == null &&
                <div />
            }
            {(auction != null && auction?.end_time > formatTime(new Date()) && auction?.status == "active") &&
                <div>
                    <p>auction id: {auction.auction_id}</p>
                    <p>item name: {auction.item_name}</p>
                    <p>information: {auction.information}</p>
                    <p>item id: {localStorage.getItem("id")}</p>
                    <p>seller id: {auction.seller_id}</p>
                    <p>winner id: {auction.winner_id}</p>
                    <p>starting bid: {auction.starting_bid}</p>
                    <p>highest bid id: {auction.highest_bid}</p>
                    <p>status: {auction.status}</p>
                    <p>start time: {auction.start_time}</p>
                    <p>end time: {auction.end_time}</p>
                    <img id="itemImg"></img>
                    <div>
                        {/**TODO: for onkeyup, make sure user cannot enter something less than highest bid*/}
                        <input id = "bidInput" placeholder="Enter a bid..." onKeyUp={() => {}} type = "number" className="rounded-md w-32 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-1 [&::-webkit-outer-spin-button]:appearance-none text-end"></input>
                        <button onClick={() => placeBidFunction()} className = "border border-gray-100">Place Bid</button>
                    </div>
                    
                    <div>
                        <p>Bids</p>
                        {bids.map((bid, index) => {
                            return(
                                <BidDisplay key = {index} bid = {bid}></BidDisplay> //easier to just give entire bid instead of fields separately
                            )
                        })}
                    </div>
                </div>
            }
            {(auction != null && auction?.end_time < formatTime(new Date()) && auction?.status != "active") &&
                <div>
                    <p>Auction has expired</p>
                </div>
            }
        </div>
    )
}