const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

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

app.get("/",(req,res) => {
    res.send("hi,i am root");
});

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400,msg);
    }else{
        next();
    }
};

//index route
app.get("/listings", async (req,res) => {
    const allListing = await Listing.find({});
   res.render("listings/index.ejs",{allListing});
   // res.send("hello");
    
});

//new route
app.get("/listing/new",(req,res)=>{
   // res.send("hello");
    res.render("listings/new.ejs");
});





//Create route 
app.post("/listings",validateListing, wrapAsync(async (req,res)=>{
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));

//Edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    
    let {id} =req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));


//show route
app.get("/listings/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

//delete route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
   // res.send("hello");
}));

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