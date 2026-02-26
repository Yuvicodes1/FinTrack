const admin = require("../config/firebaseAdmin");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ── 1. Check header exists and is a Bearer token ────────────────────────
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided.",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // ── 2. Verify token with Firebase Admin SDK ────────────────────────────
    const decoded = await admin.auth().verifyIdToken(idToken);

    // ── 3. Attach decoded user to request for controllers to use ──────────
    req.user = decoded; // decoded.uid is the firebaseUID

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token.",
    });
  }
};