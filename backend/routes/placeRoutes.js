const express = require("express");
const { check } = require("express-validator");

const placeController = require("../controllers/placeController");
const fileUpload = require("../middleware/fileUpload");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:pid", placeController.getPlaceById);
router.get("/user/:uid", placeController.getPlacesByUserId);
router.use(auth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placeController.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeController.updatePlace
);

router.delete("/:pid", placeController.deletePlace);

module.exports = router;
