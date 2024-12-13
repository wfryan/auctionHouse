'use client';
import { useRouter } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { getUsername } from '../utils/jwt';

const SellerProfile = () => {

  const router = useRouter();
  const user = getUsername()

  const [error, setError] = useState("");
  const [username, setUsername] = useState("")
  const [userInfo, setUserInfo] = useState({ user_id: 0, description: "", location: "", age: 0 });
  const [balance, setBalance] = useState(0)
  useEffect(() => {
    if (user != null) {
      setUsername(user)
    }

    pullUserInfo()
  }, [])


  // Dummy data, eventually use Lambda Functions to retrieve information



  // Function to go back to the previous page
  const handleBackButton = () => {
    router.push('/auction_dashboard')
  };

  const pullUserInfo = async () => {
    const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/users/viewUserFunds", {
      method: "POST",
      body: JSON.stringify({ username: user })
    })
    const jsonResp = await resp.json()
    console.log(jsonResp.body)
    setUserInfo(jsonResp.body.user)
    setBalance(jsonResp.body.user.balance)
  }

  const closeAccount = async () => {
    try {
      const password = (document.getElementById("password") as HTMLInputElement).value
      if (password != "") {
        const resp = await fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/users/closeAccount", {
          method: "POST",
          body: JSON.stringify({
            user_id: userInfo.user_id,
            password: password
          })
        })
        const respJson = await resp.json()
        console.log(respJson)
        setUserInfo(respJson.body.user)
        if (respJson.body.user.is_active == 0) {
          router.push("/login")
        }
        else {
          setError(respJson.body.message)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const addToBalance = async () => {
    try {
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
    } catch (error) {
      console.log(error)
    }
  }

  function checkAddition() {
    if (1 > parseInt((document.getElementById("addInput") as HTMLInputElement).value) || (document.getElementById("addInput") as HTMLInputElement).value == "") {
      (document.getElementById("addInput") as HTMLInputElement).value = "1"
    }
    else if (parseInt((document.getElementById("addInput") as HTMLInputElement).value) > 999999999999) {
      (document.getElementById("addInput") as HTMLInputElement).value = "999999999999"
    }
  }

  return (
    <div className="p-4 md:p-5 font-sans max-w-7xl mx-auto">
      <div className="mb-6">
        {/* Back Button */}


        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-5">
          Seller Profile Page
        </h1>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 md:p-5 bg-white">
        <button
          onClick={handleBackButton}
          className="px-4 py-2 text-sm text-black border-2 border-black rounded-md mb-4 hover:bg-gray-100"
        >
          Back
        </button>
        <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-8">
          {/* Left side - User Information */}
          <div className="w-full md:w-3/5 space-y-3">
            <div className="bg-gray-100 p-3 rounded-md text-black">
              {"Name: " + username}
            </div>

            <div className="bg-gray-100 p-3 rounded-md min-h-16 text-black">
              {"Description: " + userInfo.description}
            </div>

            <div className="flex justify-between bg-gray-100 p-3 rounded-md text-black">
              {`Balance: $${balance}`}
              <div className="px-20">
                <input className="rounded-md w-32 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-1 [&::-webkit-outer-spin-button]:appearance-none text-end" id="addInput" onKeyUp={() => checkAddition()} defaultValue={1} type="number"></input>
                <button className="hover:bg-green-100 px-1 border-2 border-black rounded-md mx-1" onClick={() => addToBalance()}>Add Funds</button>
              </div>
            </div>

            {/* <div className="bg-gray-100 p-3 rounded-md text-black">
              {"Balance: " + userInfo.balance}
            </div> */}
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-row md:flex-col justify-center md:justify-start gap-3">

            <div className="flex flex-row md:flex-col justify-center md:justify-start gap-3 text-black">
              <button
                onClick={() => closeAccount()}
                className="px-4 py-2 bg-white border-2 border-black rounded-md cursor-pointer w-full md:w-40 hover:bg-red-50 text-black text-sm md:text-base"
              >
                Close Account
              </button>
              <label htmlFor="password">Password: </label>
              <input className="rounded-md w-32 border-2 border-black rounded-md mx-1" type="text" id="password"></input>
              {error != "" &&
                <p>{error}</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SellerProfileWrapper = () => {
  return (
    <Suspense fallback={<div>Awaiting user data</div>}>
      <SellerProfile />
    </Suspense>
  )
}

export default SellerProfileWrapper;
