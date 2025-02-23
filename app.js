const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session"); // ✅ Correct package
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions = {
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7,
    }
};

app.get("/",(req,res) => {
    res.send("hi,i am root");
});
//console.log(sessionOptions);
//console.log(session);
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async (req,res) =>{
    let fakeUser = new User({
        email:"student@gmail.com",
        username:"delta-student",
    });

    let registereduser = await User.register(fakeUser,"helloworld");
    res.send(registereduser);
});


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",userRouter);


// app.get("/testing",async (req,res) => {
//     let samplelisting = new Listing({
//         title:"my new villa",
//         Decompression:"by the beach",
//         price:1200,
//         location:"goa",
//         country:"india",
//     });

//     await samplelisting.save();
//     console.log("sample is saved");
//     res.send("succsesfull testing");
// });

app.all("*",(req,res,next) =>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next) =>{
    let {statusCode=500,message="somthing went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
});

 app.listen(8080,() =>{
    console.log("server is listening to port 8080");
});