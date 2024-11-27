import { useRouter } from 'next/navigation';
import { getToken } from '../utils/cookie';
import { useEffect, useState } from 'react';
export default function LoginButton() {
  const router = useRouter();
  const [hidden, setHidden] = useState<boolean>();
  useEffect(() => {
    if (getToken() != null) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  }, [])
  /**
   * Login Button
   */
  const handleLogin = () => {
    router.push('/login')
  };

  return (
    <div>
      <button hidden={hidden}
        onClick={handleLogin}
        className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
      >
        Login
      </button>
    </div>
  )
}