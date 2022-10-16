const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    title : {type : String , required : true}, //example : front-end
    parent : {type : mongoose.Types.ObjectId , default : undefined} // example : web developer id

},{
    id : false ,
    versionKey : false , // The default is __v
    toJSON : {
        virtuals : true 
        /**
         * 1. virtual is a property that is not stored(not save) in MongoDB. 
         * 2. Virtuals are typically used for computed properties on documents.
         * To include virtuals in res.json(), you need to set the toJSON schema option to { virtuals: true }.
         */
    }
});
Schema.virtual("children" , { 
    /**
     * A populated virtual contains documents from another collection
     */
    // the children name must be not save for any item in database
    ref : "category" , // The ref option, which tells Mongoose which model to populate(پرکند) documents from.
    localField : "_id" , // the filed we want search on ref(children) by it
    foreignField : "parent" // the filed we want matches this document's localField.
})
function autoPopulate(next){
    this.populate([{path : "children", select : {__v : 0 , id : 0}}]);
    next() 
}
Schema.pre('findOne' , autoPopulate).pre("find" , autoPopulate)
 /**
     * pre is middleware functions are executed one after another, when each middleware calls next.
     * we say every place we do "findOne" do this function
     */
module.exports = {
    CategoryModel : mongoose.model("category" , Schema)
}