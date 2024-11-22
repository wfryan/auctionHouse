import { useRouter, useSearchParams } from "next/navigation"

export default function StatDisplay({bal}: {bal: number}){
    const router = useRouter()
    const searchParams = useSearchParams()
    const user = searchParams?.get('username')
    return(
        <div className = {"border border-gray-100"}>
            <p>{bal}</p>
            <p onClick={() => router.push("/buyer_profile?username=" + user)}>{user}</p>
        </div>
    )
}