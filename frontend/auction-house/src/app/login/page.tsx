'use client'
import { useState } from "react"
import { useRouter } from 'next/navigation';

import { instance, header } from '../utils/auctionHouseApi';
import { saveToken } from "../utils/cookie";


const LoginPage = () => {
    const router = useRouter();
    const [displayError, setDE] = useState("")
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {


        const functionInput = JSON.stringify({
            username: username,
            password: password
        });

        console.log(functionInput)

        if (username == "" || password == "") {
            setDE("Please enter a username and password.");
            return;
        } else {
            setDE("");
            setLoading(true);
        }

        try {
            const response = await instance.post('/users/login', functionInput);
            const status = response.data.statusCode;
            console.log(response);

            if (status === 200) {
                //alert(response.data);
                console.log(response.data);
                setDE("");
                const accountType = response.data.body.type;
                saveToken(response.data.body.token);
                if (accountType == "buyer") {
                    router.push('/search');
                } else if (accountType == "seller") {
                    router.push('/auction_dashboard');
                } else if (accountType == "admin") {

                }
            } else {
                if (status === 404) {
                    setDE("User does not exist");
                } else {
                    setDE("invalid login");
                }
                // Handle any other status codes appropriately
                //alert('Error: ' + response.data.body); // Adjust based on your response structure

            }
        } catch (error) {
            console.log(error);
            alert('There was an error in login. Please try again.');
        } finally {
            setLoading(false); // Hide loading spinner
        }


    }

    const handleSignup = () => {
        router.push('/signup')
        //window.location.href = '/pages/signup';
    };

    return (
        <div className="min-h-screen flex items-center ">

            <div className="p-4 md:p-5 font-sans max-w-md mx-auto">

                <div className="mb-6">
                    <div className="flex justify-between items-center bg-gray-100 p-3 rounded-t-md font-medium text-black">
                        <div className="text-center w-full">Login Here</div>
                        <button
                            onClick={handleSignup}
                            className="px-3 py-1 bg-gray-200 text-blue-600 rounded-md hover:bg-gray-300 font-medium ml-4"
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="border border-gray-300 rounded-b-md p-4">
                        {/* Username */}
                        <div className="mb-4">
                            <label htmlFor="user" className="block text-sm font-medium text-white">Username</label>
                            <input
                                name="user"
                                id="user"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="pass" className="block text-sm font-medium text-white">Password</label>
                            <input
                                name="pass"
                                id="pass"
                                type="password"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>



                        {/* Error Message */}
                        <p className="text-red-500 text-sm mt-2">{displayError}</p>


                        {/* Submit Button with Loading Indicator */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={login}
                                type="button"
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                                disabled={loading} // Disable button while loading
                            >
                                {loading ? (
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : null}
                                {loading ? 'Loading...' : 'Log in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoginPage;