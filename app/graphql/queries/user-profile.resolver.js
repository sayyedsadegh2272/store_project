const { GraphQLList } = require("graphql");
const { BlogModel } = require("../../models/blogs");
const { CourseModel } = require("../../models/course");
const { ProductModel } = require("../../models/products");
const { commentSchema } = require("../../models/public.schema");
const { getBasketOfUser } = require("../../utils/function");
const { BlogType } = require("../typeDefs/blog.type");

const getUserBookmarkedBlogs = {
    type : new GraphQLList(BlogType),
    resolve : async (_ , args , context)=> {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req);
        const blogs = await BlogModel.find({bookmarks : user._id}).populate([
            {path : 'author'},
            {path : "category"},
            {path : "comments.user"},
            {path : "comments.answers.user"},
            {path : "likes"},
            {path: "dislikes"},
            {path: "bookmarks"},
        ])
        return blogs
    }
}
const getUserBookmarkedProducts = {
    type : new GraphQLList(ProductType),
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const products = await ProductModel.find({bookmarks : user._id}).populate([
            {path : 'supplier'}, 
            {path: "category"},
            {path: "comments.user"},
            {path: "comments.answers.user"},
            {path: "likes"},
            {path: "dislikes"},
            {path: "bookmarks"},
        ]);
        return products
    }
}
const getUserBookmarkedCourses = {
    type : new GraphQLList(CourseType),
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const courses = await CourseModel.find({bookmarks : user._id}).populate([
            {path : 'teacher'}, 
            {path: "category"},
            {path: "comments.user"},
            {path: "likes"},
            {path: "dislikes"},
            {path: "bookmarks"},
        ]);
        return courses
    }
}
const getUserBasket = {
    type : AnyType,
    resolve : async (_, args, context) => {
        const {req} = context;
        const user = await VerifyAccessTokenInGraphQL(req)
        const userDetail = await getBasketOfUser(user._id)
        return userDetail
    }
}
module.exports = {
    getUserBookmarkedBlogs,
    getUserBookmarkedCourses,
    getUserBookmarkedProducts,
    getUserBasket
}