const express = require("express");
const router = express.Router();
const userAuth = require("../controllers/userAuthController");
const authUser = require("../middleware/authUser");

router.post("/signup", userAuth.signup);
router.post("/signup/otp", userAuth.requestSignupOtp);
router.post("/reset-password/otp", userAuth.requestResetPasswordOtp);
router.post("/signup/verify", userAuth.verifySignupOtp);
router.post("/reset-password", userAuth.resetPassword);
router.post("/login", userAuth.login);
router.get("/me", authUser, userAuth.me);
router.put("/me", authUser, userAuth.updateProfile);
router.put("/me/password", authUser, userAuth.changePassword);
router.get("/me/cart", authUser, userAuth.getCart);
router.put("/me/cart", authUser, userAuth.updateCart);
router.get("/me/addresses", authUser, userAuth.listAddresses);
router.post("/me/addresses", authUser, userAuth.addAddress);
router.put("/me/addresses/:addressId", authUser, userAuth.updateAddress);
router.delete("/me/addresses/:addressId", authUser, userAuth.deleteAddress);
router.delete("/me", authUser, userAuth.deleteAccount);

module.exports = router;