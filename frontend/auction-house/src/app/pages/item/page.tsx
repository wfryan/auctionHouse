'use client'
import Auction from "@/app/entitites/Auction"
import { useEffect, useState } from "react"

export default function ItemPage() {
    const [auction, setAuction] = useState<Auction | null>(null)
    const [dispError, setDispError] = useState(false) //error unused atm
    const displayImage = (imgElement: HTMLImageElement) => {
        const dataUrl = localStorage.getItem("img")
        if (dataUrl) {
            imgElement.src = dataUrl;
        }
    }

    useEffect(() => {
        console.log(localStorage.getItem("id"))
        const fetchData = async () => {
            try {
                const body = {
                    id: localStorage.getItem("id")
                }
                const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/items/viewItem", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })
                const awaitResp = await resp
                const jsonItemResp = (await awaitResp.json()).body.item
                console.log(jsonItemResp)
                setAuction(new Auction(jsonItemResp.auction_id, jsonItemResp.item_id, jsonItemResp.seller_id, jsonItemResp.starting_bid, jsonItemResp.highest_bid, jsonItemResp.status, jsonItemResp.start_time, jsonItemResp.end_time))
                displayImage((document.getElementById("itemImg") as HTMLImageElement))
            } catch (error) {
                setDispError(true)
                console.log(error);
                console.log(dispError);
            }
        }
        fetchData()
    }, [])

    return (
        <div>
            {auction == null &&
                <div />
            }
            {auction != null &&
                <div>
                    <p>auction id: {auction?.getAID()}</p>
                    <p>item name: {localStorage.getItem("name")}</p>
                    <p>item info: {localStorage.getItem("info")}</p>
                    <p>item id: {localStorage.getItem("id")}</p>
                    <p>seller id: {auction.getSID()}</p>
                    <p>winner id: {auction.getSID()}</p>
                    <p>starting bid: {auction.getSBid()}</p>
                    <p>highest bid: {auction.getHBid()}</p>
                    <p>status: {auction.getStatus()}</p>
                    <img id="itemImg"></img>
                </div>
            }
        </div>
    )
}