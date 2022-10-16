const { GraphQLString } = require("graphql");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { VerifyAccessTokenInGraphQL } = require("../../http/middlewares/verifyAccessToken");
const { BlogModel } = require("../../models/blogs");
const { CourseModel } = require("../../models/course");
const { ProductModel } = require("../../models/products");
const { ResponseType } = require("../typeDefs/public.types");
const { checkExistProduct, checkExistCourse, checkExistBlog } = require("../utils");

const DislikesProduct = {
    type : ResponseType,
    args : {
        productID : {type : GraphQLString}
    } , 
    resolver : async (_ , args , context)=> {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {productID} = args;
        await checkExistProduct(productID);
        let likedProduct = await ProductModel.findOne({
            id : productID,
            likes : user._id
        })
        let disLikedProduct = await ProductModel.findOne({
            _id : productID ,
            dislikes : user._id
        })
        const updateQuery = disLikedProduct? {$pull : {dislikes : user._id}} : {$push : {dislikes : user._id}}
        await ProductModel.updateOne({_id : productID} , updateQuery)
        let message 
        if(!disLikedProduct) {
            if(likedProduct)await ProductModel.updateOne({_id : productID } , {$pull : {likes : user._id}})
            message = "ننپسندیدن محصول با موفقیت ثبت شد"
        } else message = "ننپسندیدن محصول لغو شد"
        return {
            statusCode : HttpStatus.CREATED,
            data : {
                message
            }
        }
    }
}
const DislikesCourse = {
    type : ResponseType,
    args : {
        courseID : {type : GraphQLString}
    } , 
    resolver : async (_ , args , context)=> {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const {courseID} = args;
        await checkExistCourse(courseID);
        let likedCourse = await CourseModel.findOne({
            id : courseID,
            likes : user._id
        })
        let disLikedCourse = await CourseModel.findOne({
            _id : courseID ,
            dislikes : user._id
        })
        const updateQuery = disLikedCourse? {$pull : {dislikes : user._id}} : {$push : {dislikes : user._id}}
        await CourseModel.updateOne({_id : courseID} , updateQuery)
        let message 
        if(!disLikedCourse) {
            if(likedCourse)await CourseModel.updateOne({_id : courseID } , {$pull : {likes : user._id}})
            message = "ننپسندیدن دوره با موفقیت ثبت شد"
        } else message = "ننپسندیدن دوره لغو شد"
        return {
            statusCode : HttpStatus.CREATED,
            data : {
                message
            }
        }
    }
}
const DislikesBlog ={
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
        const updateQuery = disLikedBlog? {$pull : {dislikes : user._id}} : {$push : {dislikes : user._id}}
         //دیدی وقتی قلب اینستا قرمزه اگه بزنی روش لایکش حذف می شه !
        //if likedCourse was ... pull remove like if was and push created like if empty
        await BlogModel.updateOne({_id : blogID} , updateQuery)
        let message
        if(!disLikedBlog){
            if(likedBlog) await BlogModel.updateOne({_id : blogID} , {$pull : {dislike : user._id}})
            message = "نپسندیدن مقاله با موفقیت انجام شد"
        }else message = "نپسندیدن مقاله لغو شد"
        return {
            statusCode : HttpStatus.CREATED,
            data : {
                message
            }
        }
    }
}
module.exports = {
    DislikesBlog,
    DislikesCourse,
    DislikesProduct
}