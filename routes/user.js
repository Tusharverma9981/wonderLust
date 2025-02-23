const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
})

router.post("/signup",wrapAsync( async (req,res) =>{
    try {
        let {username,email,password} = req.body;
        const newUser = new User({ email,username});
        const registereduser = await User.register(newUser,password);
        console.log(registereduser);
        req.login(registereduser,(err) =>{
            if(err){
                return next(err);
            };
            req.flash("success","Welcome to WanderLust");
        res.redirect("/listings");

        });
        
    } catch (error) {
        req.flash("error",error.message);
        res.redirect("/signup");
    };
   // res.send("hello");

}));

router.get("/login",(req,res) =>{
    res.render("user/login.ejs");
});

router.post("/login",saveRedirectUrl,passport.authenticate("local",{
    failureFlash:true,
    failureRedirect:"/login",
    failureFlash:true,
}),
async (req,res) =>{
    req.flash("success","Welcome Back to Wanderlust");
    let redirectUrls = res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrls);
}
);

router.get("/logout",(req,res,next) =>{
    req.logOut((err) => {
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;