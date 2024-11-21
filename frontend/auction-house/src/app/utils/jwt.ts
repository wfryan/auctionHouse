import { jwtDecode } from "jwt-decode";
import { getToken } from "./cookie";

export const decodeToken = (token: string): { [key: string]: any } | null => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

export const getUsername = () => {

    let token = getToken();
    if (token) {
        let decodedToken = decodeToken(token);
        if (decodedToken) {
            return decodedToken.username;
        } else {
            return null;
        }

    }

}
