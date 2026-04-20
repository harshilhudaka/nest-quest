const express = require("express");
const router = express.Router({mergeParams:true});
const wrapasync = require("../util/wrapasync.js");
const ExpressError = require("../util/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// Post review Route
router.post("/", isLoggedIn, validateReview, wrapasync(reviewController.createReview));

router.delete("/:reviewId" , isLoggedIn, isReviewAthor, wrapasync(reviewController.destroyReview));

module.exports = router;