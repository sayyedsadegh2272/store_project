const Joi = require("@hapi/joi");
const createError = require("http-errors");
const { MongoIDPattern } = require("../../../utils/constans");

const createBlogSchema = Joi.object({
    title : Joi.string().min(3).max(30).error(createError.BadRequest("عنوان دسته بندی صحیح نمی باشد")),
    text : Joi.string().error(createError.BadRequest("متن اصلی ارسال شده صحیح نمی باشد")),
    short_text : Joi.string().error(createError.BadRequest("متن کوتاه ارسال شده صحیح نمی باشد")),
    filename : Joi.string().pattern(/(\.png|\.jpg|\.wep|\.jpeg|\.gif)$/).error(createError.BadRequest("تصویر ارسال شده صحیح نمی باشد")),
    tags: Joi.array().min(0).max(20).error(createError.BadRequest("برچسب ها نمی تواند بیشتر از 20 آیتم باشد")),
    category : Joi.string().pattern(MongoIDPattern).error(createError.BadRequest ("دسته بندی مورد نظر یافت نشد")),
    fileUploadPath : Joi.allow()
});
const updateCategorySchema = Joi.object({
    title : Joi.string().min(3).max(30).error(createError.BadRequest("عنوان دسته بندی صحیح نمی باشد")),
});
module.exports = {
    createBlogSchema
}