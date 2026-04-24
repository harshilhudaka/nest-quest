if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

// console.log(process.env.CLOUD_API_SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./util/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user.js");

const listingroutes = require("./routes/listing.js");
const reviewroutes = require("./routes/review.js");
const userroutes = require("./routes/user.js");

// const mongo_url = 'mongodb://127.0.0.1:27017/nest-quest';
const dbUrl = process.env.ATLASDB_URL;

async function startServer() {
    try {
        await mongoose.connect(dbUrl);
        console.log("DB is connected");

        app.listen(3000, () => {
            console.log("Server is listening on port 3000");
        });

    } catch (err) {
        console.log("DB Connection Error:", err);
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: "mysupersecretcode" },
    touchAfter: 24 * 3600
});

store.on("error", () =>{
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

// app.get("/", (req, res) => {
//     res.send("hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registerUser = await User.register(fakeUser, "helloworld");
//     res.send(registerUser);
// });

app.use("/listings", listingroutes );
app.use("/listings/:id/reviews", reviewroutes);
app.use("/", userroutes);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

// app.listen(3000, () => {
//     console.log("server is listening to port 3000");
// });


startServer();