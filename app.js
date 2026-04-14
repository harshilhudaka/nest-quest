const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapasync = require("./util/wrapasync.js");
const ExpressError = require("./util/ExpressError.js");
const {listingSchema} = require("./schema.js");


const mongo_url = 'mongodb://127.0.0.1:27017/nest-quest';

main().then(() => {
    console.log("DB is connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(mongo_url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("hi, I am root");
});

const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next
    }
}

app.get("/listings", wrapasync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
})
);

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

app.get("/listings/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
})
);

app.post("/listings",validateListing, wrapasync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

app.get("/listings/:id/edit", wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})
);

app.put("/listings/:id",validateListing, wrapasync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
})
);

app.delete("/listings/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
})
);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

app.listen(3000, () => {
    console.log("server is listening to port 3000");
});



// app.get("/testinglisting",async (req,res)=>{
//     let samplelisting = new listing({
//         title: "My new villa",
//         discription: "by the beach",
//         price: 1200,
//         location: "calangute, Goa",
//         contury: "India",
//     });
//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// }); 