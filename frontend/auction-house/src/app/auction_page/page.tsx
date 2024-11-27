'use client'
import { useEffect, useState } from "react"
import BidDisplay from "../components/BidDisplay"
import StatDisplay from "../components/StatDisplay"
import { useRouter, useSearchParams } from "next/navigation"
import { getUsername } from "../utils/jwt"
import { instance } from "../utils/auctionHouseApi"
import BuyerInfo from "../components/BuyerInfo"
import { getToken } from "../utils/cookie"
import LoginButton from "../components/LoginButton"
import SignOutButton from "../components/SignoutButton"

export interface Bid { //export needed in BidDisplay
    bid_id: number,
    auction_id: number,
    buyer_id: number,
    amount: number,
    bidTime: Date,
    username: string,
}

export default function AuctionPage() {
    interface Auction {
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
        isBuyNow: number
        picture: string
    }

    const router = useRouter()

    const user = getUsername()

    const [auction, setAuction] = useState<Auction | null>(null)
    const [bids, setBids] = useState<Bid[]>([])
    const [userData, setUserData] = useState({ balance: 0, user_id: 0 })
    const [dispError, setDispError] = useState(false) //error unused atm

    const body = JSON.stringify({ username: user })



    const formatTime = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = (now.getMonth() + 1).toString().padStart(2, '0')
        const day = now.getDate().toString().padStart(2, '0')
        const hours = now.getHours().toString().padStart(2, '0')
        const minutes = now.getMinutes().toString().padStart(2, '0')
        const seconds = now.getSeconds().toString().padStart(2, '0')
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        return formattedDateTime
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
            const jsonItemResp = awaitRespJson.body.item
            const jsonAuctionBids = awaitRespJson.body.bids

            console.log(jsonItemResp);

            setAuction(jsonItemResp)
            console.log(auction)
            setBids(jsonAuctionBids)

            setUserData(awaitRespJson.body.user)
            console.log("auction type")
            console.log(auction?.isBuyNow)
        } catch (error) {
            setDispError(true)
            console.log(error)
            console.log(dispError)
        }
    }

    useEffect(() => {
        fetchData()
        console.log(userData)
    }, [auction?.picture])

    /**TODO: ?: page should refresh every 30 seconds or so correct? to refresh bids. */

    const handleBuyNow = async () => {
        const functionInput = JSON.stringify({
            username: getUsername(),
            auctionId: auction?.auction_id,
            token: `Bearer ${getToken()}`
        })

        try {
            const response = await instance.post('/auction/buyNow', functionInput)
            const status = response.data.statusCode;
            if (status === 200) {
                console.log(response.data)
                alert("Awaiting fulfillment!")
                router.push('/buyer_profile')
            }
            else {
                console.log(`Error: ${response.data}`)
            }
        }
        catch (error) {
            console.log(`Error: ${error}`)
        }

    }

    const placeBidFunction = async () => {
        console.log(userData.user_id)
        const bidValue = (document.getElementById("bidInput") as HTMLInputElement).value
        console.log(parseInt(bidValue))
        console.log(auction?.auction_id)
        console.log(formatTime())
        try {
            console.log(bids)
            if (bids.length == 0 && auction != null) {
                if (bidValue == "" || parseInt(bidValue) < auction?.starting_bid) {
                    alert("Bid value invalid")
                    throw new Error("Bid value invalid")
                }
            }
            else {
                if (bidValue == "" || parseInt(bidValue) < bids[0].amount) {
                    alert("Bid value invalid")
                    throw new Error("Bid value invalid")
                }
            }
            const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/auction/placeBid", {
                method: "POST",
                body: JSON.stringify({
                    amount: parseInt(bidValue),
                    auction_id: auction?.auction_id,
                    buyer_id: userData.user_id,
                    bidTime: formatTime()
                })
            })
            const respJson = await resp.json()
            console.log(respJson)
            setAuction(respJson.body.item)
            setBids(respJson.body.bids)
            setUserData(respJson.body.user)
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleSearchClick = () => {
        router.push("/search")
    }


    return (
        <div>
            <div>
                <LoginButton />
            </div>
            <div>
                <SignOutButton />
            </div>
            <div>
                <BuyerInfo />
            </div>

            <br></br><br></br>
            <button
                onClick={handleSearchClick}
                className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
            >
                Search
            </button>
            {auction == null &&
                <div />
            }
            {(auction != null && auction?.end_time > formatTime() && auction?.status == "active") &&
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
                    <p>start time: {auction.start_time.toString()}</p>
                    <p>end time: {auction.end_time.toString()}</p>
                    <div id="buyNow" hidden={!auction.isBuyNow}>
                        <button onClick={() => handleBuyNow()} className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black">Buy Now</button>
                    </div>
                    <img id="itemImg" src={auction.picture}></img>
                    <div hidden={!!auction.isBuyNow}>
                        {/**TODO: for onkeyup, make sure user cannot enter something less than highest bid*/}
                        <input id="bidInput" placeholder="Enter a bid..." onKeyUp={() => { }} type="number" className="rounded-md w-32 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-1 [&::-webkit-outer-spin-button]:appearance-none text-end"></input>
                        <button onClick={() => placeBidFunction()} className="border border-gray-100">Place Bid</button>
                    </div>

                    <div hidden={!!auction.isBuyNow}>
                        <p>Bids</p>
                        {bids.map((bid, index) => {
                            return (
                                <BidDisplay key={index} bid={bid}></BidDisplay> //easier to just give entire bid instead of fields separately
                            )
                        })}
                    </div>
                </div>
            }
            {
                (auction != null && auction?.end_time < formatTime() && auction?.status != "active") &&
                <div>
                    <p>Auction has expired</p>
                </div>
            }
        </div >
    )
}