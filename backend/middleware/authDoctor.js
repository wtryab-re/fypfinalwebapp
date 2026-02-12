import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    //   Check for both 'dtoken' and 'dToken' (case-insensitive)
    const token = req.headers.dtoken || req.headers.dToken;

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    //   Set docId in req.body for compatibility
    req.body.docId = token_decode.id;

    next();
  } catch (error) {
    console.log("❌ Auth middleware error:", error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
