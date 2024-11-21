import { removeToken } from "../utils/cookie";
import { useRouter } from 'next/navigation';
export default function SignOutButton(){
    const router = useRouter();

    const handleSignout = () => {
        removeToken();
        router.push('/login')
      };

    return(
        <button
        onClick={handleSignout}
        className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
      >
      Log Out
      </button>
    )
}