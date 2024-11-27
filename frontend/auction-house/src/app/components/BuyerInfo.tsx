import { useRouter } from 'next/navigation';
import { instance } from '../utils/auctionHouseApi';
import { getUsername } from '../utils/jwt';
import { useEffect, useState } from 'react';
import StatDisplay from './StatDisplay';
import { getToken } from '../utils/cookie';
export default function BuyerInfo() {

    /**
     * Buyer Info
     */
    const user = getUsername()

    const router = useRouter()
    const [hidden, setHidden] = useState<boolean>();

    const [userInfo, setUserInfo] = useState({ username: "", balance: 0 })
    useEffect(() => {
        if (getToken() != null) {
            setHidden(true)
        } else {
            setHidden(false)
        }
        pullUserInfo()
    }, [])

    const body = JSON.stringify({ username: user })

    const pullUserInfo = async () => {
        const resp = await instance.post('/users/viewUserFunds', body);
        console.log(resp);

        const userData = resp.data.body.user;
        setUserInfo(prevState => ({
            ...prevState,
            username: getUsername(),
            balance: userData.balance
        }));
        console.log(userInfo)
    }

    const handleProfile = () => {
        router.push("/buyer_dashboard")
    }

    return (
        <div hidden={hidden}>
            <button onClick={handleProfile}>{userInfo.username}</button>
            <StatDisplay bal={userInfo.balance}></StatDisplay>
        </div>

    )
}