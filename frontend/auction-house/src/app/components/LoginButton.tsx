import { useRouter } from 'next/navigation';
export default function LoginButton(){
    const router = useRouter();

    /**
     * Login Button
     */
    const handleLogin = () => {
        router.push('/login')
      };

    return(
        <button
        onClick={handleLogin}
        className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
      >
      Login
      </button>
    )
}