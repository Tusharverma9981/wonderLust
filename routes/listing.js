const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {listingSchema ,reviewSchema} = require("../schema.js");

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
router.get("/", async (req,res) => {
    const allListing = await Listing.find({});
   res.render("listings/index.ejs",{allListing});
   // res.send("hello");
    
});

//new route
router.get("/new",(req,res)=>{
    //res.send("hello");
    res.render("listings/new.ejs");
});





//Create route 
router.post("/",validateListing, wrapAsync(async (req,res)=>{
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));

//Edit route
router.get("/:id/edit",wrapAsync(async (req,res)=>{
    
    let {id} =req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

router.put("/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));


//show route
router.get("/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//delete route
router.delete("/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
   // res.send("hello");
}));

module.exports = router;
