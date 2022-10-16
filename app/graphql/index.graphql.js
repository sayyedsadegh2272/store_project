const { GraphQLObjectType, GraphQLSchema } = require("graphql");
const { BlogResolver } = require("./queries/blog.resolver");
const { CategoriesResolver, CategoryChildResolver } = require("./queries/category.resolver");
const{CreateCommentForBlog,CreateCommentForProduct,CreateCommentForCourse} = require("./mutations/comment.resolver")
const {LikeBlog , LikeCourse , LikeProduct} = require("./mutations/likes.resolver")
const{DislikesBlog , DislikesCourse , DislikesProduct} = require("./mutations/dislikes.resolver")
const {BookmarkProduct , BookmarkCourse , BookmarkBlog} = require("./mutations/bookmarks.resolver")
const {AddCourseToBasket , AddProductToBasket, RemoveCourseFromBasket, RemoveProductFromBasket} = require("./mutations/basket.resolver")
const { CourseResolver } = require("./queries/course.resolver");
const { ProductResolver } = require("./queries/product.resolver");


const RootQuery = new GraphQLObjectType({
    name : "RootQuery" ,
    fields : {
        blogs : BlogResolver , 
        products : ProductResolver,
        categories : CategoriesResolver,
        childOfCategory : CategoryChildResolver ,
        courses : CourseResolver
    }
})
const RootMutation = new GraphQLObjectType({
    name : "Mutation",
    fields : {
    CreateCommentForBlog,
    CreateCommentForProduct,
    CreateCommentForCourse,
    LikeBlog,
    LikeCourse,
    LikeProduct,
    DislikesBlog,
    DislikesCourse,
    DislikesProduct,
    BookmarkProduct,
    BookmarkCourse,
    BookmarkBlog,
    AddCourseToBasket,
    AddProductToBasket,
    RemoveCourseFromBasket,
    RemoveProductFromBasket
    }
})
const graphQlSchema = new GraphQLSchema({
    query : RootQuery ,
    mutation : RootMutation
})
module.exports = {
    graphQlSchema
}