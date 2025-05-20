// import { asyncHandler } from '../utils/asyncHandler.js'
// import { ApiError } from '../utils/ApiError.js'
// import jwt from 'jsonwebtoken'
// import {User} from '../models/user.model.js'


// export const verifyJWT = asyncHandler(async (req, res, next) => {
//     try {
//         // Debug: Log cookies and headers for troubleshooting
//         console.log('Cookies:', req.cookies);
//         console.log('Authorization Header:', req.header('Authorization'));

//         let token = req.cookies?.accessToken;
//         if (!token) {
//             const authHeader = req.header('Authorization');
//             if (authHeader && authHeader.startsWith('Bearer ')) {
//                 token = authHeader.substring(7); // Remove 'Bearer '
//             }
//         }

//         if (!token) {
//             throw new ApiError(401, 'Unauthorized request');
//         }

//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//         const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

//         if (!user) {
//             throw new ApiError(401, 'Unauthorized request');
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error('JWT verification error:', error); // Log actual error for debugging
//         throw new ApiError(401, 'Invalid access token');
//     }
// })

import jwt from "jsonwebtoken";
import {User} from '../models/user.model.js'

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};