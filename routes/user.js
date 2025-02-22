const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
})

router.post("/signup",wrapAsync( async (req,res) =>{
    try {
        let {username,email,password} = req.body;
        const newUser = new User({ email,username});
        const registereduser = await User.register(newUser,password);
        console.log(registereduser);
        req.flash("success","Welcome to WanderLust");
        res.redirect("/listings");

    } catch (error) {
        req.flash("error",error.message);
        res.redirect("/signup");
    };
   // res.send("hello");

}));

router.get("/login",(req,res) =>{
    res.render("user/login.ejs");
});

router.post("/login",passport.authenticate("local",{
    failureFlash:true,
    failureRedirect:"/login"
}),(req,res) =>{
    req.flash("success","Welcome Back");
    res.redirect("/listings");
}
);

module.exports = router;