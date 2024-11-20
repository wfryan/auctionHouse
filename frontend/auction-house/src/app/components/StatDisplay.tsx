import { useRouter, useSearchParams } from "next/navigation"

export default function StatDisplay(){
    const router = useRouter()
    const searchParams = useSearchParams()
    const user = searchParams?.get('username')
    return(
        <div className = {"border border-gray-100"}>
            <p>{localStorage.getItem("userBal")}</p>
            <p onClick={() => router.push("/buyer_profile?username=" + user)}>{user}</p>
        </div>
    )
}