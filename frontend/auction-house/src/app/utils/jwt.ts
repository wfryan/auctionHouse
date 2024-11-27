import { jwtDecode } from "jwt-decode";
import { getToken } from "./cookie";


interface DecodedToken {
    userId: number;
    username: string;
    account_type: string;
}
/**
 * 
 * @param token jwt tokens
 * @returns 
 */
export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
};

// export const isTokenExpired = (token: string): boolean => {
//     const decoded = jwtDecode(token);
//     if (!decoded) return true;

//     const currentTime = Date.now() / 1000;
//     if (decoded.exp) {
//         return decoded.exp < currentTime;
//     } else {
//         return true;
//     }

// };

export const getUsername = () => {

    const token = getToken();
    if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken) {
            return decodedToken.username;
        } else {
            return null;
        }

    }
}

export const getAccountType = () => {

    const token = getToken();
    if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken) {
            return decodedToken.account_type;
        } else {
            return null;
        }

    }
}
