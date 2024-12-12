import { setCookie, parseCookies, destroyCookie } from "nookies";

/**
 * 
 * @param token jtw token for cookies
 */

export const saveToken = (token: string) => {
    //until logout is implemented
    removeToken();

    setCookie(null, "authToken", token, {
        maxAge: 24 * 60 * 60, // 30 days
        path: "/",
    });
};

export const getToken = (): string | null => {
    const cookies = parseCookies();
    console.log("cookies: ")
    console.log(cookies)
    if (cookies.authToken) { return cookies.authToken }
    else { return null }
};

export const removeToken = () => {
    destroyCookie(null, "authToken");
};
