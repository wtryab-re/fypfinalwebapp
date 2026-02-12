import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    const token = req.headers.atoken; // same header you’re using
    if (!token) {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.json({ success: false, message: "Invalid user role" });
    }

    req.admin = decoded; // store decoded data for later if needed
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Auth failed: " + error.message });
  }
};

export default authAdmin;
