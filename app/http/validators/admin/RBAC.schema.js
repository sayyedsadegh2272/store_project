const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const { MongoIDPattern } = require("../../../utils/constans");

const addRoleSchema = Joi.object({
    title : Joi.string().min(3).max(30).error(createHttpError.BadRequest("عنوان نقش صحیح نمی باشد")),
    description : Joi.string().min(0).max(100).error(createHttpError.BadRequest("توضیحات نقش صحیح نمی باشد")),
    permissions : Joi.array().items(Joi.string().pattern(MongoIDPattern)).error(createHttpError.BadRequest("دسترسی های ارسال شده صحیح نمی باشد")) 
});
const addPermissionSchema = Joi.object({
    name : Joi.string().min(3).max(30).error(createHttpError.BadRequest("اسم سطح دسترسی صحیح نمی باشد")),
    description : Joi.string().min(0).max(100).error(createHttpError.BadRequest("توضیحات درسترسی صحیح نمی باشد"))
});

module.exports = {
    addRoleSchema,
    addPermissionSchema
}