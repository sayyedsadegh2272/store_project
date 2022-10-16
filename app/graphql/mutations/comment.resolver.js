const { GraphQLString } = require("graphql");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { VerifyAccessTokenInGraphQL } = require("../../http/middlewares/verifyAccessToken");
const { BlogModel } = require("../../models/blogs");
const { copyObject } = require("../../utils/function");
const { ResponseType } = require("../typeDefs/public.types");
const { checkExistBlog, checkExistProduct, checkExistCourse } = require("../utils");
const { ProductModel } = require("../../models/products");
const { CourseModel } = require("../../models/course");


const CreateCommentForBlog ={
    type : ResponseType , 
    args : {
        comment : {type : GraphQLString},
        blogID : {type : GraphQLString},
        parent : {type : GraphQLString},
        // parent this comment is replay for other comment

    },
    resolver : async (_ , args , context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req);
        const {comment , blogID , parent} = args
        if(!mongoose.isValidObjectId(blogID)) throw createHttpError.BadGateway("شناسه بلاگ ارسال شده صحیح نمی باشد")
        await checkExistBlog(blogID)
        if(parent && mongoose.isValidObjectId(parent)){
            const commentDocument = await getComment(BlogModel , parent)
            if(commentDocument && !commentDocument?.openToComment)throw createHttpError.BadRequest("ثبت پاسخ مجاز نیست")
            const createAnswerResult = await BlogModel.updateOne({
                _id : blogID ,
                "comments._id" : parent
            }, {
                $push : {
                    "comments.$.answers" : {
                        comment,
                        user : user._id,
                        show : false,
                        openToComment : false
                    }
                }
            });
            if(!createAnswerResult.modifiedCount){
                throw createHttpError.InternalServerError("ثبت پاسخ انجام نشد")
            }
            return {
                statusCode : HttpStatus.CREATED,
                data : {
                    message : "پاسخ شما با موفقیت ثبت شد"
                }
            }
        }else{
            await BlogModel.updateOne({_id : blogID} , {
                $push : {comments : {
                    comment,
                    user : user._id,
                    show : false,
                    openToComment : true
                }}
            })
        }
        return {
            statusCode : HttpStatus.CREATED , 
            data : {
                message : "ثبت نظر با موفقیت انجام شد و پس از تایید در وبسایت قرار می گیرد"
            }
        }

    }
}
const CreateCommentForProduct ={
    type : ResponseType , 
    args : {
        comment : {type : GraphQLString},
        productID : {type : GraphQLString},
        parent : {type : GraphQLString},
        // parent this comment is replay for other comment

    },
    resolver : async (_ , args , context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req);
        const {comment , productID , parent} = args
        if(!mongoose.isValidObjectId(productID)) throw createHttpError.BadGateway("شناسه محصول ارسال شده صحیح نمی باشد")
        await checkExistProduct(productID)
        if(parent && mongoose.isValidObjectId(parent)){
            const commentDocument = await getComment(ProductModel , parent)
            if(commentDocument && !commentDocument?.openToComment)throw createHttpError.BadRequest("ثبت پاسخ مجاز نیست")
            const createAnswerResult = await ProductModel.updateOne({
                _id : productID,
                "comments._id" : parent
            }, {
                $push : {
                    "comments.$.answers" : {
                        comment,
                        user : user._id,
                        show : false,
                        openToComment : false
                    }
                }
            });
            if(!createAnswerResult.modifiedCount){
                throw createHttpError.InternalServerError("ثبت پاسخ انجام نشد")
            }
            return {
                statusCode : HttpStatus.CREATED,
                data : {
                    message : "پاسخ شما با موفقیت ثبت شد"
                }
            }
        }else{
            await ProductModel.updateOne({_id : productID} , {
                $push : {comments : {
                    comment,
                    user : user._id,
                    show : false,
                    openToComment : true
                }}
            })
        }
        return {
            statusCode : HttpStatus.CREATED , 
            data : {
                message : "ثبت نظر با موفقیت انجام شد و پس از تایید در وبسایت قرار می گیرد"
            }
        }

    }
}
const CreateCommentForCourse ={
    type : ResponseType , 
    args : {
        comment : {type : GraphQLString},
        courseID : {type : GraphQLString},
        parent : {type : GraphQLString},
        // parent this comment is replay for other comment

    },
    resolver : async (_ , args , context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req);
        const {comment , courseID , parent} = args
        if(!mongoose.isValidObjectId(courseID)) throw createHttpError.BadGateway("شناسه محصول ارسال شده صحیح نمی باشد")
        await checkExistCourse(courseID)
        if(parent && mongoose.isValidObjectId(parent)){
            const commentDocument = await getComment(CourseModel , parent)
            if(commentDocument && !commentDocument?.openToComment)throw createHttpError.BadRequest("ثبت پاسخ مجاز نیست")
            const createAnswerResult = await CourseModel.updateOne({
                _id : courseID,
                "comments._id" : parent
            }, {
                $push : {
                    "comments.$.answers" : {
                        comment,
                        user : user._id,
                        show : false,
                        openToComment : false
                    }
                }
            });
            if(!createAnswerResult.modifiedCount){
                throw createHttpError.InternalServerError("ثبت پاسخ انجام نشد")
            }
            return {
                statusCode : HttpStatus.CREATED,
                data : {
                    message : "پاسخ شما با موفقیت ثبت شد"
                }
            }
        }else{
            await CourseModel.updateOne({_id : courseID} , {
                $push : {comments : {
                    comment,
                    user : user._id,
                    show : false,
                    openToComment : true
                }}
            })
        }
        return {
            statusCode : HttpStatus.CREATED , 
            data : {
                message : "ثبت نظر با موفقیت انجام شد و پس از تایید در وبسایت قرار می گیرد"
            }
        }

    }
}
async function getComment(model , id){
    const findComment = await model.findOne({"comments._id" : id} , {"comments.$" : 1});
    const comment = copyObject(findComment)
    if(!comment?.comments?.[0]) throw createHttpError.NotFound("کامنتی با این مشخصات یافت نشد")
    return comment?.comments?.[0]
}
module.exports = {
    CreateCommentForBlog,
    CreateCommentForProduct,
    CreateCommentForCourse
}