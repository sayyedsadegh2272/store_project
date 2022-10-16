const createError = require("http-errors");
const mongoose = require("mongoose");
const { CategoryModel } = require("../../../../models/categories");
const { addCategorySchema, updateCategorySchema } = require("../../../validators/admin/category.schema");
const Controller = require("../../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");

class CategoryController extends Controller {
    async addCategory(req , res , next){
        try {
            await addCategorySchema.validateAsync(req.body);
            const {title , parent} = req.body;
            const category = await CategoryModel.create({title , parent});
            if(!category) throw createError.InternalServerError("خطای داخلی")
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED ,
                data : {
                    message: "دسته بندی جدید با موفقیت افزوده شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async removeCategory(req , res , next){
        //we went remove category and all sub categories
        try {
            const {id} = req.params;
            const category = await this.checkExistCategory(id)
            const deleteResult= await CategoryModel.deleteMany({
                $or: [
                    {_id : category._id} ,
                    {parent : category._id}
            ]})
            if(deleteResult.deletedCount == 0) throw createError.InternalServerError("حذف دسته بندی انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data : {
                    message : "حذف دسته بندی با موفقیت انجام شد"
                }
            })
        } catch (error) {
            
        }
    }
    async editCategoryTitle(req , res , next){
        try {
            // we can only change title of categories
            const {id} = req.params;
            const{title} = req.body;
            const category = await this.checkExistCategory(id);
            await updateCategorySchema.validateAsync(req.body);
            const resultOfUpdate = await CategoryModel.updateOne({_id : id} , {$set : {title}})
            if(resultOfUpdate.modifiedCount == 0 ) throw createError.InternalServerError("به روز رسانی انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data : {
                    message : "به روز رسانی با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllParents(req , res , next){
        try {
            //we want get all parents in site 
            const categories = await CategoryModel.find(
                { parent: undefined },
                { __v: 0 }
              );
              return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: {
                  categories,
                },
              });
        } catch (error) {
            next(error)
        }
    }
    async getChildOfParents(req , res , next){
        try {
            //we went get all child of special parent by id of parent
            const {parent} = req.params;
            const children = await CategoryModel.find({parent} , {__v : 0 , parent : 0})
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data: {
                    children
                }
            })
        } catch (error) {
            next (error)
        }
    }
    async getAllCategoryWithoutPopulate(req , res , next){
        try {
            const categories = await CategoryModel.aggregate([
                {$match : {}}
            ]);
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK ,
                data : {
                    categories
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async checkExistCategory(id){
        // we want try is category find in database
        const category = await CategoryModel.findById(id);
        if(!category) throw createError.NotFound("دسته بندی یافت نشد");
        return category
    }
    async getAllCategory(req , res , next){
        try {
            // we want get all category in database
            // const categories = await CategoryModel.aggregate([
            //     {
            //         $lookup : {
            //             from : "categories" , // go to the categories in database mongodb
            //             localField : "_id", // and find all item has _id and parent
            //             foreignField : "parent" , //id and parent is ==
            //             as : "children" // get all in new object and save name children
            //         }
            //     },
            //     {
            //         $project : {
            //             __v : 0 ,
            //             "children.__v" : 0,
            //             "children.parent" : 0
            //         }
            //     },
            //     {
            //         $match : {
            //             parent : undefined
            //         }
            //     }
            // ])
            // const categories = await CategoryModel.aggregate([
            //     {
            //         $graphLookup : {
            //             from : "categories" , // go to the categories in database mongodb
            //             startWith : "$_id",
            //             connectFromField : "_id", // and find all item has _id and parent
            //             connectToField : "parent" , //id and parent is ==
            //             maxDepth : 5 ,
            //             depthField : "depth" , 
            //             as : "children" // get all in new object and save name children
            //         }
            //     },
            //     {
            //         $project : {
            //             __v : 0 ,
            //             "children.__v" : 0,
            //             "children.parent" : 0
            //         }
            //     },
            //     {
            //         $match : {
            //             parent : undefined
            //         }
            //     }
            // ])
            const categories = await CategoryModel.find({parent : undefined})
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data : {
                    categories
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async getCategoryById(req , res , next){
        try {
             const {id:_id} = req.params;
             const category = await CategoryModel.aggregate([
                {
                    $match : { _id : mongoose.Types.ObjectId(_id)}
                },
                {
                    $lookup : {
                        from : "categories" , // go to the categories in database mongodb
                        localField : "_id", // and find all item has _id and parent
                        foreignField : "parent" , //id and parent is ==
                        as : "children" // get all in new object and save name children
                    }
                },
                {
                    $project : {
                        __v : 0 ,
                        "children.__v" : 0,
                        "children.parent" : 0
                    }
                }
            ]);
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK ,
                data : {
                    category
                }
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports ={
    CategoryController : new CategoryController()
}