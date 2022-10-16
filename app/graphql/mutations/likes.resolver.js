const { VerifyAccessTokenInGraphQL } = require("../../http/middlewares/verifyAccessToken");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { BlogModel } = require("../../models/blogs");
const { ResponseType } = require("../typeDefs/public.types");
const { checkExistBlog, checkExistProduct, checkExistCourse } = require("../utils");
const { CourseModel } = require("../../models/course");
const { ProductModel } = require("../../models/products");
const { GraphQLString } = require("graphql");

const LikeBlog ={
    type : ResponseType,
    args : {
        blogID : {type : GraphQLString}
    },
    resolver : async (_ , args , context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req);
        const {blogID} = context;
        await checkExistBlog(blogID)
        let likedBlog = await BlogModel.findOne({
            _id : blogID,
            likes : user._id
        })
        let disLikedBlog = await BlogModel.findOne({
            _id : blogID,
            dislikes : user._id
        })
        const updateQuery = likedBlog? {$pull : {likes : user._id}} : {$push : {likes : user._id}}
         //دیدی وقتی قلب اینستا قرمزه اگه بزنی روش لایکش حذف می شه !
        //if likedCourse was ... pull remove like if was and push created like if empty
        await BlogModel.updateOne({_id : blogID} , updateQuery)
        let message
        if(!likedBlog){
            if(disLikedBlog) await BlogModel.updateOne({_id : blogID} , {$pull : {dislike : user._id}})
            message = "پسندیدن مقاله با موفقیت انجام شد"
        }else message = "پسندیدن مقاله لغو شد"
        return {
            statusCode : HttpStatus.CREATED,
            data : {
                message
            }
        }
    }
}
const LikeCourse ={
    type : ResponseType,
    args : {
        courseID : {type : GraphQLString}
    },
    resolver : async (_ , args , context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req);
        const {courseID} = context;
        await checkExistCourse(courseID)
        let likedCourse = await CourseModel.findOne({
            _id : courseID,
            likes : user._id
        })
        let disLikedCourse = await CourseModel.findOne({
            _id : courseID,
            dislikes : user._id
        })
        const updateQuery = likedCourse? {$pull : {likes : user._id}} : {$push : {likes : user._id}}
         //دیدی وقتی قلب اینستا قرمزه اگه بزنی روش لایکش حذف می شه !
        //if likedCourse was ... pull remove like if was and push created like if empty
        await CourseModel.updateOne({_id : courseID} , updateQuery)
        let message
        if(!likedCourse){
            if(disLikedCourse) await CourseModel.updateOne({_id : courseID} , {$pull : {dislike : user._id}})
            message = "پسندیدن دوره با موفقیت انجام شد"
        }else message = "پسندیدن دوره لغو شد"
        return {
            statusCode : HttpStatus.CREATED,
            data : {
                message
            }
        }
    }
}
const LikeProduct ={
    type : ResponseType,
    args : {
        productID : {type : GraphQLString}
    },
    resolver : async (_ , args , context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req);
        const {productID} = context;
        await checkExistProduct(productID)
        let likedProduct = await ProductModel.findOne({
            _id : productID,
            likes : user._id
        })
        let disLikedProduct = await ProductModel.findOne({
            _id : productID,
            dislikes : user._id
        })
        const updateQuery = likedProduct? {$pull : {likes : user._id}} : {$push : {likes : user._id}}
        //دیدی وقتی قلب اینستا قرمزه اگه بزنی روش لایکش حذف می شه !
        //if likedProduct was ...pull remove like if was and push created like if empty
        await ProductModel.updateOne({_id : productID} , updateQuery)
        let message
        if(!likedProduct){
            if(disLikedProduct) await ProductModel.updateOne({_id : productID} , {$pull : {dislike : user._id}})
            message = "پسندیدن محصول با موفقیت انجام شد"
        }else message = "پسندیدن محصول لغو شد"
        return {
            statusCode : HttpStatus.CREATED,
            data : {
                message
            }
        }
    }
}
module.exports = {
    LikeBlog,
    LikeCourse,
    LikeProduct

}