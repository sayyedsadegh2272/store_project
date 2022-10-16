const mongoose = require("mongoose");
const { commentSchema } = require("./public.schema");

const BlogSchema = new mongoose.Schema({
    author : {type : mongoose.Types.ObjectId , ref: "user" ,required : true} ,
    // author is writer of blog
    title : {type : String , required : true},
    short_text : {type : String , required : true},
    text : {type : String , required : true},
    image : {type : String , required : true},
    tags : {type : [String] , default : []} , 
    category : {type : [mongoose.Types.ObjectId] , ref: "category", required : true} , 
    comments : {type :[commentSchema] , default : []} ,
    likes : {type : [mongoose.Types.ObjectId] , ref:"user" ,  default :[]},
    // ref mean where we can know who like the comment 
    dislikes : {type : [mongoose.Types.ObjectId] , ref:"user" ,default :[]} ,
    bookmarks : {type : [mongoose.Types.ObjectId] , ref:"user" ,default :[]}, 
    //bookmark mean save this blog
},{
    
    timestamps :true , 
    versionKey : false, //The default is __v 
    toJSON : {
        virtuals : true 
        /**
         * 1. virtual is a property that is not stored(not save) in MongoDB. 
         * 2. Virtuals are typically used for computed properties on documents.
         * To include virtuals in res.json(), you need to set the toJSON schema option to { virtuals: true }.
         */
    }
    
});
BlogSchema.virtual("user" , { 
    /**
     * A populated virtual contains documents from another collection
     */
    // the children name must be not save for any item in database
    ref : "user" , // The ref option, which tells Mongoose which model to populate(پرکند) documents from.
    localField : "_id" , // the filed we want search on ref(children) by it
    foreignField : "author" // the filed we want matches this document's localField.
});
BlogSchema.virtual("category_detail" , { 
    /**
     * A populated virtual contains documents from another collection
     */
    // the children name must be not save for any item in database
    ref : "category" , // The ref option, which tells Mongoose which model to populate(پرکند) documents from.
    localField : "_id" , // the filed we want search on ref(children) by it
    foreignField : "parent" // the filed we want matches this document's localField.
});
BlogSchema.virtual("image_URL").get(function(){
    return `${process.env.BASE_URL}:${process.env.APPLICATION_PORT}/${this.image}`
    // this is for make image link 
})

module.exports = {
    BlogModel : mongoose.model("blog" , BlogSchema)
}