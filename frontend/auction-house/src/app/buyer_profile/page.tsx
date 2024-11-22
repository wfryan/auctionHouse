'use client'
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function BuyerProfile(){
    const router = useRouter()
    const searchParams = useSearchParams()
    const user = searchParams?.get('username'); // JohnDoe
    console.log(user)
    const appendedUrl = '?username=' + user;
    const [balance, setBalance] = useState(localStorage.getItem("userBal"))

    const addToBalance = async () => {
      try{
        const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/users/addFunds", {
          method: "POST",
          body: JSON.stringify({
            username: user,
            addFunds: parseInt((document.getElementById("addInput") as HTMLInputElement).value)
          })
        })
        const respJson = await resp.json()
        console.log(respJson)
        setBalance(respJson.body.curFunds)
      } catch(error){
        console.log(error)
      }
    }

    function checkAddition(){
       if(1 > parseInt((document.getElementById("addInput") as HTMLInputElement).value)){
        (document.getElementById("addInput") as HTMLInputElement).value = "1"
       }
       else if(parseInt((document.getElementById("addInput") as HTMLInputElement).value) > 999999999999){
        (document.getElementById("addInput") as HTMLInputElement).value = "999999999999"
       }
    }
    
    return(
        <div className="p-4 md:p-5 font-sans max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-5">
          Buyer Profile Page
        </h1>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 md:p-5 bg-white">
        <button
          onClick={() => {}}
          className="px-4 py-2 text-sm text-black border-2 border-black rounded-md mb-4 hover:bg-gray-100"
        >
          Back
        </button>
        <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-8">
          {/* Left side - User Information */}
          <div className="w-full md:w-3/5 space-y-3">
            <div className="bg-gray-100 p-3 rounded-md text-black">
              {"Name: " + user}
            </div>

            <div className="bg-gray-100 p-3 rounded-md min-h-16 text-black">
              {`${localStorage.getItem("userDescription")}`}
            </div>

            <div className="flex justify-between bg-gray-100 p-3 rounded-md text-black">
              {`Balance: $${balance}`}
              <div className="px-20">
                <input className="rounded-md w-32 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-1 [&::-webkit-outer-spin-button]:appearance-none text-end" id = "addInput" onKeyUp={() => checkAddition()} defaultValue={1} type = "number"></input>
                <button className="hover:bg-green-100 px-1 border-2 border-black rounded-md mx-1" onClick={() => addToBalance()}>Add Funds</button>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded-md min-h-16 text-black">
              {`Location: ${localStorage.getItem("userLocation")}`}
            </div>

            <div className="bg-gray-100 p-3 rounded-md min-h-16 text-black">
              {`Age: ${localStorage.getItem("userAge")}`}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-row md:flex-col justify-center md:justify-start gap-3">
            <button
              onClick={() => alert("Close Account Requested")}
              className="px-4 py-2 bg-white border-2 border-black rounded-md cursor-pointer w-full md:w-40 hover:bg-red-50 text-black text-sm md:text-base"
            >
              Close Account
            </button>
          </div>
        </div>
      </div>
    </div>
    )
}