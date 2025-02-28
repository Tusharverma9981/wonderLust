const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");  
const review = require("../models/review.js");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {listingSchema ,reviewSchema} = require("../schema.js");
const {isLoggedIn} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


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
router.get("/new",isLoggedIn,(req,res)=>{
 res.render("listings/new.ejs");
});





//Create route 
router.post("/",upload.single("listing[image]"), validateListing,wrapAsync(async (req,res)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.Owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");

}));

//Edit route
router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
    
    let {id} =req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Cannot find that listing");
         res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250,");
    //console.log(originalImageUrl);
    res.render("listings/edit.ejs",{listing , originalImageUrl});
}));

router.put("/:id",upload.single("listing[image]"),validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
        
    req.flash("success"," Listing Updated!");
    res.redirect(`/listings/${id}`);
}));


//show route
router.get("/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Cannot find that listing");
        return res.redirect("/listings");
    }
    //console.log(listing);
    res.render("listings/show.ejs",{listing});
}));

//delete route
router.delete("/:id",isLoggedIn,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted!");
    res.redirect("/listings");
   // res.send("hello");
}));

module.exports = router;
