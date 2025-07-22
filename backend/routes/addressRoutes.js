const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const auth = require("../middlewares/authentication");

router.get("/", auth, addressController.getUserAddresses);
router.post("/", auth, addressController.addAddress);
router.put("/:id", auth, addressController.updateAddress);
router.delete("/:id", auth, addressController.deleteAddress);
router.patch("/:id/default", auth, addressController.setDefaultAddress);

module.exports = router;
