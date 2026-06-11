import jwt from "jsonwebtoken";


export const protect = (req, res, next) => {
    try {
        // get token from header and return 401 for i don't fucking know who you are
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided",
                success: false
            });
        }

        const token = authHeader.split(" ")[1];

        // verify token
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        // attach user info to request
        req.user = {
            userId: decoded.userId
        };

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        });
    }
};

/* if you got 401 on any req then
    hit the  refresh token api
    if you get 403 code then refresh is expired

*/