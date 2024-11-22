'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
export default function Signup() {
    const [adSelected, setAdSelected] = useState(false)
    const [displayError, setDE] = useState(false)
    const router = useRouter();
    const signupFunction = async () => {
        const username = (document.getElementById("user") as HTMLInputElement).value
        const password = (document.getElementById("pass") as HTMLInputElement).value
        const age = (document.getElementById("age") as HTMLInputElement).value
        const type = (document.getElementById("type") as HTMLInputElement).value
        const location = (document.getElementById("loc") as HTMLInputElement).value
        const body = {
            username: username,
            password: password,
            age: age,
            type: type,
            location: location
        }
        
        console.log(body)

        try {
            if (username == "" || password == "") {
                throw (new Error("error"))
            }
            const resp = fetch("https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse/users/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })

            const awaitResp = await resp
            const jsonResp = await awaitResp.json()
            console.log(jsonResp)

            if (jsonResp.statusCode == 200) {
                router.push('/login')
            }
            else {
                throw new Error("error")
            }
        }
        catch (error) {
            console.error(error)
            setDE(true)
        }
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="border border-gray-300 rounded-md">
                <div className="text-black bg-white flex justify-around font-sans font-medium color font-sans font-medium p-4">
                    <p className="py-2">Sign Up</p>
                    <button onClick={() => {router.push("/login")}} className="px-3 py-2 bg-gray-200 text-blue-600 rounded-md hover:bg-gray-300 font-medium ml-4">Login</button>
                </div>
                <div className="font-sans font-medium color rounded-md p-4">
                    <div className="mb-4">
                        <label className="block" htmlFor="user">Username </label>
                        <input className = "px-4 py-2 rounded-md text-black" name="user" id="user" />
                    </div>
                    <div className="mb-4">
                        <label className="block" htmlFor="pass">Password </label>
                        <input className = "px-4 py-2 rounded-md text-black" name="pass" id="pass" />
                    </div>
                    <div className="mb-4">
                        <label className="block" htmlFor="age">Age </label>
                        <input className = "px-4 py-2 rounded-md text-black" type="number" defaultValue={"18"} min="18" max="100" name="age" id="age" />
                    </div>
                    <div className="mb-4">
                        <label className="block" htmlFor="loc">Location </label>
                        <input className = "px-4 py-2 rounded-md text-black" name="loc" id="loc" />
                    </div>
                    <div className="mb-4">
                        <label className="block" htmlFor="type">Account Type </label>
                        <select className = "px-4 py-2 rounded-md text-black" id="type" defaultValue="buyer" onChange={() => { if ((document.getElementById("type") as HTMLSelectElement).value == "admin") { setAdSelected(true) } else { setAdSelected(false) } }} name="type">
                            {["Buyer", "Seller", "Admin"].map(type => {
                                return (
                                    <option key={type} value={type.toLowerCase()}>{type}</option>
                                )
                            })}
                        </select>
                    </div>
                    {adSelected &&
                        <div>
                            <div>
                                <label htmlFor="adminUser">Admin Credentials Username </label>
                                <input name="adminUser" id="adminUser" />
                            </div>
                            <div>
                                <label htmlFor="adminPass">Admin Credentials Password </label>
                                <input name="adminPass" id="adminPass" />
                            </div>
                        </div>
                    }
                    {displayError &&
                        <p>There was an error creating the account, please try again</p>
                    }
                    <div className = "flex">
                        <button className = "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex m-auto items-center" onClick={() => signupFunction()} type="button">Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    )
}