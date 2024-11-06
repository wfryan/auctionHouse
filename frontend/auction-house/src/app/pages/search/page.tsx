'use client'
import { useState, useRef } from "react"
import AuctionItemClickable from "@/app/components/AuctionItemClickable"
import AuctionItem from "@/app/entitites/AuctionItem"
export default function Search(){
    const [auctions, setAuctions] = useState([])
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
            const tmpArray: any = []
            let curItem;
            for(let i = 0; i < jsonResp.body.items.length; i++){
                curItem = jsonResp.body.items[i]
                tmpArray.push(new AuctionItem(curItem.auction_item_id, curItem.item_name, curItem.information == null ? "":curItem.information, curItem.picture == null ? "":curItem.picture))
            }
            //set auctions
            console.log(tmpArray)
            setAuctions(tmpArray)
        }
        catch(error){
            setDispError(true)
        }
    }
    return(
        <div>
            <input placeholder="Search..." ref = {input} id = "srchbar" /><button onClick = {() => searchFunc()}>Search Items</button>
            {auctions.map(auction => {
                return(
                    <AuctionItemClickable aucItem = {auction}></AuctionItemClickable>
                )
            })}
            {dispError &&
                <p>There was an error retrieving the auction items</p>
            }
        </div>
    )
}