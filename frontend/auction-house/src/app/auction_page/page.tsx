'use client'
import { useEffect, useState } from "react"
import BidDisplay from "../components/BidDisplay"
import StatDisplay from "../components/StatDisplay"
import { useRouter, useSearchParams } from "next/navigation"

export interface Bid{ //export needed in BidDisplay
    userID: number,
    username: string,
    amount: number,
    bidTime: Date
}

export default function AuctionPage() {
    interface Auction{
        auction_id: number
        seller_id: number
        starting_bid: number
        highest_bid: number //id of highest bid
        status: string
        start_time: Date
        end_time: Date
        winner_id: number
    }

    const router = useRouter()
    const searchParams = useSearchParams()
    const user = searchParams?.get("username")
    const [auction, setAuction] = useState<Auction | null>(null)
    const [bids, setBids] = useState<Bid[]>([])
    const [dispError, setDispError] = useState(false) //error unused atm
    const displayImage = (imgElement: HTMLImageElement) => {
        const dataUrl = localStorage.getItem("img")
        if (dataUrl) {
            imgElement.src = dataUrl
        }
    }
    
    const formatTime = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = (now.getMonth() + 1).toString().padStart(2, '0')
        const day = now.getDate().toString().padStart(2, '0')
        const hours = now.getHours().toString().padStart(2, '0')
        const minutes = now.getMinutes().toString().padStart(2, '0')
        const seconds = now.getSeconds().toString().padStart(2, '0')
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
        return formattedDateTime
    }

    const returnAuctionJSON = (auction_id: number, seller_id: number, starting_bid: number, highest_bid: number, status: string, start_time: Date, end_time: Date, winner_id: number) => {
        return {auction_id: auction_id, seller_id: seller_id, starting_bid: starting_bid, highest_bid: highest_bid, status: status, start_time: start_time, end_time: end_time, winner_id: winner_id}
    }
    
    const fetchData = async () => {
        try {
            console.log(localStorage.getItem("id"))
            const body = {
                id: localStorage.getItem("id")
            }
            const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/items/viewItem", { //TODO: lambda function should also now grab all currently placed bids referring to this auction's id and send back an array of related bids
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
            setAuction(returnAuctionJSON(jsonItemResp.auction_id, jsonItemResp.seller_id, jsonItemResp.starting_bid, jsonItemResp.highest_bid, jsonItemResp.status, jsonItemResp.start_time, jsonItemResp.end_time, NaN))
            setBids(jsonAuctionBids)
            displayImage((document.getElementById("itemImg") as HTMLImageElement))
        } catch (error) {
            setDispError(true)
            console.log(error)
            console.log(dispError)
        }
    }

    useEffect(() => {
        console.log(localStorage.getItem("id"))
        fetchData()
    }, [])

    /**TODO: ?: page should refresh every 30 seconds or so correct? to refresh bids. */

    const placeBidFunction = async () => {
        const bidValue = (document.getElementById("bidInput") as HTMLInputElement).value
        try{
            if(bidValue == "" || parseInt(bidValue) < bids[0].amount){ //TODO: make sure bids list is ordered in lambda by price with highest at front of list
                throw new Error("there was an error")
            }
            const resp = await fetch("", {
                method: "POST",
                body: JSON.stringify({
                    amount: bidValue,
                    auction_id: 1,
                    buyer_id: localStorage.getItem("userId"),
                    time: formatTime()
                })
            })
        }
        catch(error){
            console.log(error)
        }
    }

    return (
        <div>
            <StatDisplay></StatDisplay>
            {auction == null &&
                <div />
            }
            {auction != null &&
                <div>
                    <p>auction id: {auction.auction_id}</p>
                    <p>item name: {localStorage.getItem("name")}</p>
                    <p>item info: {localStorage.getItem("info")}</p>
                    <p>item id: {localStorage.getItem("id")}</p>
                    <p>seller id: {auction.seller_id}</p>
                    <p>winner id: {auction.winner_id}</p>
                    <p>starting bid: {auction.starting_bid}</p>
                    <p>highest bid: {auction.highest_bid}</p>
                    <p>status: {auction.status}</p>
                    <p>start time: {auction.start_time.toString()}</p>
                    <p>end time: {auction.end_time.toString()}</p>
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
        </div>
    )
}