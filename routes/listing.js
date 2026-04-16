const express = require("express");
const router = express.Router();
const wrapasync = require("../util/wrapasync.js");
const ExpressError = require("../util/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing");


const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

router.get("/", wrapasync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
})
);

router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

router.get("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
})
);

router.post("/",validateListing, wrapasync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

router.get("/:id/edit", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})
);

router.put("/:id",validateListing, wrapasync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
})
);

router.delete("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
})
);

module.exports = router;