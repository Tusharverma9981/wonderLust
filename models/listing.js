const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        type:String,
        default:"https://www.psdstack.com/wp-content/uploads/2019/08/copyright-free-images-750x420.jpg",
        set:(v) => v === ""? "https://www.psdstack.com/wp-content/uploads/2019/08/copyright-free-images-750x420.jpg" : v,
    },
    price:Number,
    location:String,
    country:String,
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;