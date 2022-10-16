const { GraphQLList, GraphQLString } = require("graphql");
const { CategoryModel } = require("../../models/categories");
const { CategoryType } = require("../typeDefs/category.type");

const CategoriesResolver = {
    type : new GraphQLList(CategoryType),
    resolve : async () =>{
        const categories = await CategoryModel.find({parent : undefined})
        return categories
        // use for get all categories without parent
    }
}
const CategoryChildResolver = {
    type : new GraphQLList(CategoryType),
    // list why ? => because maybe has three or ... child
    args : {
        parent : {type : GraphQLString}
        // we have defined the args before sent them key
    },
    resolve : async (_ , args)=> {
        const {parent} = args
        //sent key parent as a args 
        const categories = await CategoryModel.find({parent});
        return categories
    }
}
module.exports = {
    CategoriesResolver,
    CategoryChildResolver
}