import { useRouter } from 'next/navigation';
import { instance } from '../utils/auctionHouseApi';
import { getUsername } from '../utils/jwt';
import { useEffect, useState } from 'react';
import { getToken } from '../utils/cookie';
export default function BuyerInfo() {

    /**
     * Buyer Info
     */

    const router = useRouter()

    const [mounted, setMounted] = useState(false);

    const [hidden, setHidden] = useState<boolean | null>(null);
    const [user, setUser] = useState("")

    const [userInfo, setUserInfo] = useState({ username: "", balance: null, tmpUsedFunds: 0 })
    useEffect(() => {
        setMounted(true);
        const tempUser = getUsername();
        console.log("username:")
        console.log(tempUser)
        if (tempUser != null || tempUser != undefined)
            setUser(tempUser)
    }, [])

    useEffect(() => {
        if (user) {
            pullUserInfo();
        }
    }, [user]);

    useEffect(() => {
        if (mounted) {
            if (getToken() != null) {
                console.log("No here")
                console.log(hidden)
                setHidden(true)
            } else {
                console.log("Here")
                setHidden(false)
            }
        }
    }, [mounted]);

    const pullUserInfo = async () => {
        try {
            const body = JSON.stringify({ username: user })
            console.log("test body")
            console.log(body)

            const resp = await instance.post('/users/viewUserFunds', body);
            console.log(resp);

            const userData = resp.data.body.user;
            setUserInfo(({
                username: user,
                balance: userData.balance,
                tmpUsedFunds: userData.tmpUsedFunds
            }));
            console.log(userInfo)
        } catch {
            console.log("failure")
        }

    }

    const handleProfile = () => {
        router.push("/buyer_dashboard")
    }

    // Prevent rendering until mounted to avoid hydration issues

    return (
        <div >
            {/* Ensures that dollar sign doesnt appear before money value*/}
            {mounted && userInfo.balance !== null && (
                <button onClick={handleProfile} className="cursor-pointer">
                    <div>
                        {/* The main content is shown when 'hidden' is true */}
                        <label className="cursor-pointer">Hello, {userInfo.username}</label>
                        <br></br>
                        <label className="cursor-pointer">${userInfo.balance} (Usable Funds: ${userInfo.tmpUsedFunds})</label>
                    </div>
                </button>
            )}
            {!mounted && (
                <div>

                </div>
            )}
        </div>
    );
}