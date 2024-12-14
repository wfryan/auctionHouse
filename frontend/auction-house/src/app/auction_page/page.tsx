'use client'
import { Suspense, useEffect, useState } from "react"
import BidDisplay from "../components/BidDisplay"
import { useRouter } from "next/navigation"
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

function AuctionPage() {
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

    const [isMounted, setIsMounted] = useState(false);

    const [auction, setAuction] = useState<Auction | null>(null)
    const [bids, setBids] = useState<Bid[]>([])
    const [userData, setUserData] = useState({ balance: 0, user_id: 0 })
    const [dispError, setDispError] = useState("")
    const [bidValue, setBidValue] = useState<string>("")
    const [editableBidValue, setEditableBidValue] = useState<boolean>(true)
    const [highestBid, setHighestBid] = useState<string>("")

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // New useEffect for periodic data refresh
    useEffect(() => {
        // Only start the interval if there's an auction
        if (auction) {
            // Set up an interval to fetch data every 30 seconds
            const intervalId = setInterval(fetchData, 30000);

            // Clean up the interval when the component unmounts or the auction changes
            return () => clearInterval(intervalId);
        }
    }, [auction]);


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
            const response = await instance.post("items/viewItem", JSON.stringify(body))

            const jsonItemResp = response.data.body.item
            const jsonAuctionBids = response.data.body.bids

            console.log(jsonItemResp);

            setAuction(jsonItemResp)
            console.log(auction)
            setBids(jsonAuctionBids)

            setUserData(response.data.body.user)
            console.log("auction type")
            console.log(auction?.isBuyNow)
        } catch (error) {
            setDispError("")
            console.log(error)
            console.log(dispError)
        }
    }

    useEffect(() => {
        fetchData()
        console.log(userData)
    }, [auction?.picture])

    useEffect(() => {
        console.log("bids")
        console.log(bids)
        if (bids != undefined && bids.length > 0) {
            setHighestBid("$" + (bids[0].amount))
            setEditableBidValue(true)
        } else {
            setHighestBid("n/a")
            setBidValue("" + auction?.starting_bid)
            setEditableBidValue(false)
        }

    }, [bids])

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
                router.push('/buyer_dashboard')
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
        console.log(auction?.auction_id)
        console.log(formatTime())

        try {
            console.log(bids)
            if (bidValue != undefined && bids.length == 0 && auction != null) {
                if (bidValue == "" || parseInt(bidValue) < auction?.starting_bid) {
                    setDispError("Bid value invalid")
                    throw new Error("Bid value invalid")
                }
            }
            else {
                if (bidValue != undefined && (bidValue == "" || parseInt(bidValue) < bids[0].amount)) {
                    setDispError("Bid value invalid")
                    throw new Error("Bid value invalid")
                }
            }
            setDispError("")
            let parsedBidValue
            if (bidValue != null) {
                parsedBidValue = parseInt(bidValue)
            }
            const body = JSON.stringify({
                amount: parsedBidValue,
                auction_id: auction?.auction_id,
                buyer_id: userData.user_id,
                bidTime: formatTime()
            })
            const response = await instance.post("/auction/placeBid", body)

            setAuction(response.data.body.item)
            setBids(response.data.body.bids)
            setUserData(response.data.body.user)
            if (response.data.status !== 200) {
                setDispError(response.data.body.message)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleSearchClick = () => {
        router.push("/search")
    }


    return (

        <div className="py-8 px-4">
            <div>
                <LoginButton />
            </div>
            <div>
                <SignOutButton />
            </div>
            <div>
                <BuyerInfo />
            </div>
            <button
                onClick={handleSearchClick}
                className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
            >
                Search
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-gray-300 p-6 rounded-lg shadow-md">

                    {auction == null &&
                        <div />
                    }
                    {(auction != null &&
                        <div className="bg-gray-100 rounded-lg shadow-lg max-w-lg mx-auto">
                            <div className="m-4">
                                <img
                                    id="itemImg"
                                    src={auction.picture}
                                    alt="Auction Item"
                                    className="w-full h-64 object-cover rounded-md shadow-md"
                                />
                            </div>
                            <div className="space-y-2 m-4">
                                <p className="text-lg font-semibold text-gray-800">Item Name: <span className="font-normal text-gray-600">{auction.item_name}</span></p>
                                <p className="text-sm text-gray-800">Information: <span className="font-light text-gray-600">{auction.information}</span></p>
                                <p className="text-sm text-gray-800">Seller ID: <span className="font-light text-gray-600">{auction.seller_id}</span></p>
                                {/* <p className="text-sm text-gray-800">Winner ID: <span className="font-light text-gray-600">{auction.winner_id}</span></p> */}
                                <p className="text-sm text-gray-800">Starting Bid: $<span className="font-light text-gray-600">{auction.starting_bid}</span></p>
                                <p className="text-sm text-gray-800">Highest Bid: <span className="font-light text-gray-600">{highestBid}</span></p>
                                <p className="text-sm text-gray-800">Status: <span className="font-light text-gray-600">{auction.status}</span></p>
                                <p className="text-sm text-gray-800">Start Time: <span className="font-light text-gray-600">{auction.start_time.toString()}</span></p>
                                <p className="text-sm text-gray-800">End Time: <span className="font-light text-gray-600">{auction.end_time.toString()}</span></p>
                            </div>

                        </div>
                    )}
                </div>
                {(isMounted && getUsername() != null && <div className="bg-gray-300 text-black p-6 rounded-lg shadow-md">
                    {/* Buy Now Section */}
                    {auction == null &&
                        <div />
                    }
                    {auction != null && (
                        <div>
                            <div
                                id="buyNow"
                                hidden={auction.status != 'active' || !auction.isBuyNow}
                                className="mt-6 flex flex-col items-center"

                            >
                                <button
                                    onClick={handleBuyNow}
                                    hidden={!auction.isBuyNow}
                                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                >
                                    Buy Now
                                </button>
                            </div>

                            <div hidden={auction != null && !!auction.isBuyNow} className="mt-4">
                                <div className="flex items-center gap-4">

                                    <input
                                        id="bidInput"
                                        value={bidValue}
                                        placeholder="Enter a bid..."
                                        onChange={(e) => setBidValue(e.target.value)}
                                        hidden={auction.status != 'active'}
                                        disabled={!editableBidValue}
                                        type="number"
                                        className="rounded-md w-32 px-4 py-2 border border-gray-300 text-end focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            appearance: "textfield",
                                        }}
                                    />
                                    <button
                                        onClick={placeBidFunction}
                                        hidden={auction.status != 'active'}
                                        className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                    >
                                        Place Bid
                                    </button>
                                    {dispError && (
                                        <p className="text-sm text-red-600">{dispError}</p>
                                    )}
                                </div>
                            </div>

                            <div hidden={auction != null && !!auction.isBuyNow} className="mt-6">
                                <p className="font-semibold text-black mb-2">Bids</p>
                                <div className="space-y-2">
                                    {bids.map((bid) => (
                                        <div
                                            className="p-2 border border-gray-200 rounded-md shadow-sm bg-gray-50"
                                            key={bid.bid_id}
                                        >
                                            <BidDisplay
                                                bid={bid}
                                            />
                                        </div>

                                    ))}
                                </div>
                            </div>
                        </div>)}

                </div>)}


            </div>

            {
                (auction != null && auction?.end_time < formatTime() && auction?.status != "active") &&
                <div>
                    <p>Auction has expired</p>
                </div>
            }
        </div >
    )

}

const AuctionPageWrapper = () => {
    return (
        <Suspense fallback={<div>Loading Auction...</div>}>
            <AuctionPage />
        </Suspense>
    );
}

export default AuctionPageWrapper