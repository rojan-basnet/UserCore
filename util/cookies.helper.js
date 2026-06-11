export const setRefreshCookie=(res, token)=> {
    res.cookie("refreshToken", token, getCookieOptions());
}

function getCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd,           // HTTPS in production
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
}
