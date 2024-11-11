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
                //const user = new User(jsonResp.body.userId, username, parseInt(age), location, type, 0)
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
        <div>
            <div>
                <label htmlFor="user">Username </label>
                <input name="user" id="user" />
            </div>
            <div>
                <label htmlFor="pass">Password </label>
                <input name="pass" id="pass" />
            </div>
            <div>
                <label htmlFor="age">Age </label>
                <input type="number" min="18" max="100" name="age" id="age" />
            </div>
            <div>
                <label htmlFor="loc">Location </label>
                <input name="loc" id="loc" />
            </div>
            <div>
                <label htmlFor="type">Account Type </label>
                <select id="type" defaultValue="buyer" onChange={() => { if ((document.getElementById("type") as HTMLSelectElement).value == "admin") { setAdSelected(true) } else { setAdSelected(false) } }} name="type">
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
            <button onClick={() => signupFunction()} type="button">Sign Up</button>
        </div>
    )
}