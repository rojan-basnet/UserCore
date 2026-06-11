import jwt from "jsonwebtoken";

export function generateAccessToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            name: user.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            name: user.name
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );
}