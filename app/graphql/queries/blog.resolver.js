const { GraphQLList } = require("graphql");
const { BlogModel } = require("../../models/blogs");
const { BlogType } = require("../typeDefs/blog.type");

const BlogResolver = {
    type : new GraphQLList(BlogType),
    resolve : async (_, args) => {
        const {category} = args
        const findQuery = category? {category} : {}
        return await BlogModel.find(findQuery).populate([
            {path : 'author'}, 
            {path: "category"}, 
            {path: "comments.user"}, 
            {path: "comments.answers.user"},
            {path: "likes"},
            {path: "dislikes"},
            {path: "bookmarks"},
        ]);
    }
}
module.exports = {
    BlogResolver
}