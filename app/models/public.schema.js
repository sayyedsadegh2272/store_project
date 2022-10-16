const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
    user : {type : mongoose.Types.ObjectId , ref : "user" , required : true },
    comment : {type : String , required : true},
    show : {type : Boolean , required : true , default : false},
    openToComment : {type : Boolean , default : false},
} ,{
    timestamps : {createdAt : true}
})

const commentSchema = new mongoose.Schema({
    user : {type: mongoose.Types.ObjectId , ref : "user"  , required : true} ,
    comment : {type : String , required : true},
    show : {type : Boolean , required : true , default : false},
    // for show comment
    openToComment : {type : Boolean , default : true},
    // is answer for this comment or not 
    answers : {type : [AnswerSchema] , default : []}
    //  mean => show me when comment is a replay for another comment
} , {
    timestamps : {createdAt : true}
})

module.exports = {
    commentSchema
}