import { useRouter } from 'next/navigation';
import { instance } from '../utils/auctionHouseApi';
import { getUsername } from '../utils/jwt';
import { useEffect, useState } from 'react';
import StatDisplay from './StatDisplay';
export default function BuyerInfo() {

    const user = getUsername()
    const [userInfo, setUserInfo] = useState({ username: "", balance: 0 })
    useEffect(() => {
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

    return (
        <div>
            <h1>{userInfo.username}</h1>
            <StatDisplay bal={userInfo.balance}></StatDisplay>
        </div>

    )
}