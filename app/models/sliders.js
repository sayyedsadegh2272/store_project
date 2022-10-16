// the slider in website 
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    title : {type : String },
    text : {type : String },
    image : {type : String , required : true},
    type : {type : String , default : " main"} , 
    // type mean what is a position of slider in website ?
});
module.exports = {
    SliderModel : mongoose.model("slider" , Schema)
}