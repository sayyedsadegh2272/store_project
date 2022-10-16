const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const { MongoIDPattern } = require("../../../utils/constans");

const addCategorySchema = Joi.object({
    title : Joi.string().min(3).max(30).error(new Error("عنوان دسته بندی صحیح نمی باشد")),
    parent : Joi.string().allow('').pattern(MongoIDPattern).allow("").error(new Error("شناسه وارد شده صحیح نمی باشد"))
    /**
     * allow() => in model of parent we set default on undefined 
     * so we use allow to nat error if the parent is empty object
     */
});
const updateCategorySchema = Joi.object({
    title : Joi.string().min(3).max(30).error(new Error("عنوان دسته بندی صحیح نمی باشد")),
});
module.exports = {
    addCategorySchema , 
    updateCategorySchema
}