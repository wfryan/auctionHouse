'use client'
import { useState, useRef, useEffect, useCallback } from "react"
import AuctionItemClickable from "@/app/components/AuctionItemClickable"
import AuctionItem from "@/app/entitites/AuctionItem"
import Link from "next/link"
export default function Search(){
    const [auctions, setAuctions] = useState<AuctionItem[]>([])
    const [dispError, setDispError] = useState(false)
    const input = useRef<HTMLInputElement>(null)
    const searchFunc = async () => {
        try{
            if(input.current == null){
                throw(new Error("error"))
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
            let tmpArray: any = []
            let curItem;
            for(let i = 0; i < jsonResp.body.items.length; i++){
                curItem = jsonResp.body.items[i]
                tmpArray.push(new AuctionItem(curItem.auction_item_id, curItem.item_name, curItem.information == null ? "":curItem.information, curItem.picture == null ? "":curItem.picture))
            }
            //set auctions
            console.log(tmpArray)
            setAuctions(prev => tmpArray)
        }
        catch(error){
            setDispError(true)
        }
    }

    const setStorage = (itemId: any, itemName: any, itemInfo: any, itemPic: any) => {
        localStorage.setItem("id", itemId)
        localStorage.setItem("name", itemName)
        localStorage.setItem("info", itemInfo)
        const dataArray = new Uint8Array(itemPic.data)
        const blob = new Blob([dataArray], { type: "application/octet-stream" })
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result == 'string') {
            localStorage.setItem("img", reader.result)
          }
        }
        reader.readAsDataURL(blob)
    }

    return(
        <div>
            <input placeholder="Search..." ref = {input} id = "srchbar" /><button onClick = {() => searchFunc()}>Search Items</button>
            {auctions.map(auction => {
                return(
                    <div key = {auction.getAIId()}>
                        <Link onClick = {() => setStorage(auction.getAIId(), auction.getIN(), auction.getInfo(), auction.getPicture())} href = {`./${auction.getAIId()}`}>
                            <AuctionItemClickable aucItem = {auction}></AuctionItemClickable>
                        </Link>
                    </div>

                )
            })}
            {dispError &&
                <p>There was an error retrieving the auction items</p>
            }
        </div>
    )
}