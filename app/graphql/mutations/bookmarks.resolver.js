const { GraphQLString } = require("graphql");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { VerifyAccessTokenInGraphQL } = require("../../http/middlewares/verifyAccessToken");
const { ResponseType } = require("../typeDefs/public.types");
const { BlogModel } = require("../../models/blogs");
const { CourseModel } = require("../../models/course");
const { ProductModel } = require("../../models/products");
const { checkExistProduct, checkExistCourse, checkExistBlog } = require("../utils");

const BookmarkProduct = {
    type : ResponseType ,
    args : {
        productID : {type : GraphQLString}
    },
    resolve : async (_ , args , context) =>{
        const {req} = context;
        const user = VerifyAccessTokenInGraphQL(req)
        const {productID} = args
        await checkExistProduct(productID)
        let BookmarkedProduct = await ProductModel.findOne({
            _id : productID,
            bookmarks : user._id
        })
        const updateQuery = BookmarkedProduct? {$pull : {bookmarks : user._id}} : {$push : {bookmarks : user._id}}
        await ProductModel.updateOne({_id : productID} , updateQuery)
        let message 
        if(!BookmarkedProduct){
            message = "محصول به لیست علاقه مند های شما اضافه شد"
        } else message = "محصول از لیست علاقه مندی های شما حذف شد"
        return {
            statusCode : HttpStatus.CREATED ,
            data : {
                message
            }
        } 
    }
}
const BookmarkCourse = {
    type : ResponseType ,
    args : {
        CourseID : {type : GraphQLString}
    },
    resolve : async (_ , args , context) =>{
        const {req} = context;
        const user = VerifyAccessTokenInGraphQL(req)
        const {CourseID} = args
        await checkExistCourse(CourseID)
        let BookmarkedCourse = await CourseModel.findOne({
            _id : CourseID,
            bookmarks : user._id
        })
        const updateQuery = BookmarkedCourse? {$pull : {bookmarks : user._id}} : {$push : {bookmarks : user._id}}
        await CourseModel.updateOne({_id : CourseID} , updateQuery)
        let message 
        if(!BookmarkedProduct){
            message = "دوره به لیست علاقه مند های شما اضافه شد"
        } else message = "دوره از لیست علاقه مندی های شما حذف شد"
        return {
            statusCode : HttpStatus.CREATED ,
            data : {
                message
            }
        } 
    }
}
const BookmarkBlog = {
    type : ResponseType ,
    args : {
        BlogID : {type : GraphQLString}
    },
    resolve : async (_ , args , context) =>{
        const {req} = context;
        const user = VerifyAccessTokenInGraphQL(req)
        const {BlogID} = args
        await checkExistBlog(BlogID)
        let BookmarkedBlog = await BlogModel.findOne({
            _id : BlogID,
            bookmarks : user._id
        })
        const updateQuery = BookmarkedBlog? {$pull : {bookmarks : user._id}} : {$push : {bookmarks : user._id}}
        await BlogModel.updateOne({_id : BlogID} , updateQuery)
        let message 
        if(!BookmarkedBlog){
            message = "مقاله به لیست علاقه مند های شما اضافه شد"
        } else message = "مقاله از لیست علاقه مندی های شما حذف شد"
        return {
            statusCode : HttpStatus.CREATED ,
            data : {
                message
            }
        } 
    }
}
module.exports = {
    BookmarkProduct,
    BookmarkCourse,
    BookmarkBlog
}