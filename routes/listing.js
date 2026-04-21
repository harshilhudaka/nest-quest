const express = require("express");
const router = express.Router();
const wrapasync = require("../util/wrapasync.js");
const Listing = require("../models/listing");
const { isLoggedIn, isowner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
    .get(wrapasync(listingController.index))
    .post(isLoggedIn,  upload.single('listing[image]'), validateListing, wrapasync(listingController.createListing));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapasync(listingController.showListing))
    .put(isLoggedIn, isowner, validateListing, wrapasync(listingController.updateListing))
    .delete(isLoggedIn, isowner, wrapasync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isowner, wrapasync(listingController.renderEditForm));


module.exports = router;