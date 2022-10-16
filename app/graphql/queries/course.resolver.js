const { GraphQLList, GraphQLString } = require("graphql");
const { CourseModel } = require("../../models/course");
const { CourseType } = require("../typeDefs/course.type");

const CourseResolver = {
    type : new GraphQLList(CourseType),
    args : {
        category : {type : GraphQLString}
        // send a node.js category and get all node's courses
    },
    resolve : async (_ , args) => {
        const {category} = args
        const findQuery = category? {category} :{}
        // if category in database be send the object and category from database into 
        // els send {} 
        return await CourseModel.find(findQuery).populate([
            {path : 'teacher'},
            {path : "category"},
            {path: "comments.user"},
            {path: "likes"},
            {path: "dislikes"},
            {path: "bookmarks"},
        ])
    }
}
module.exports = {
    CourseResolver
}