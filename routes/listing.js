const express = require("express");
const router = express.Router();
const wrapasync = require("../util/wrapasync.js");
const Listing = require("../models/listing");
const {isLoggedIn , isowner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

// Index Route
router.get("/", wrapasync(listingController.index));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show Route
router.get("/:id", wrapasync(listingController.showListing));

// Create Route
router.post("/",isLoggedIn,validateListing, wrapasync(listingController.createListing));

// Edit Route
router.get("/:id/edit",isLoggedIn, isowner, wrapasync(listingController.renderEditForm));

// Update Route
router.put("/:id",isLoggedIn, isowner, validateListing, wrapasync(listingController.updateListing));


// Delete Route
router.delete("/:id",isLoggedIn, isowner, wrapasync(listingController.destroyListing));

module.exports = router;