const createHttpError = require("http-errors");
const { StatusCodes:  HttpStatus} = require("http-status-codes");
const { PermissionsModel } = require("../../../../models/permission");
const { copyObject, deleteInvalidPropertyInObject } = require("../../../../utils/function");
const { addPermissionSchema } = require("../../../validators/admin/RBAC.schema");
const Controller = require("../../controller");

class PermissionController extends Controller{
    async getAllPermission(req , res , next){
        try {
            const permissions = await PermissionsModel.find({})
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK ,
                data : {
                    permissions
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async createNewPermission(req , res , next){
        try {
            const {name , description} = await addPermissionSchema.validateAsync(req.body)
            await this.findPermissionWithName(name)
            const permission = await PermissionsModel.create({name , description})
            if(!permission) throw createHttpError.InternalServerError("دسترسی ایجاد نشد")
            return res.status(HttpStatus.CREATED).json({
                statusCode : HttpStatus.CREATED,
                data : {
                    message : "دسترسی با موفقیت ایجاد شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async removePermission(req , res , next){
        try {
            const {id} = req.params;
            await this.findPermissionWithID(id)
            const removePermissionResult = await PermissionsModel.deleteOne({_id : id})
            if(!removePermissionResult.deletedCount) throw createHttpError.InternalServerError("دسترسی حذف نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data : {
                    message: "دسترسی با موفقیت حذف شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async updatePermissionByID(req , res , next){
        try {
            const { id } = req.params
            await this.findPermissionWithName(id)
            const data = copyObject(req.body)
            deleteInvalidPropertyInObject(data , [])
            const updatePermissionResult = await PermissionsModel.updateOne({_id : id}, {
                $set: data
            });
            if(!updatePermissionResult.modifiedCount) throw createHttpError.InternalServerError("ویرایش سطح انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data : {
                    message: "ویرایش سطح با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async findPermissionWithName(name){
        const permission = await PermissionsModel.findOne({name});
        if(permission) throw createHttpError.BadRequest("سطح دسترسی قبلا ثبت شده است")
    }
    async findPermissionWithID(_id){
        const permission = await PermissionsModel.findOne({_id});
        if(!permission) throw createHttpError.NotFound("دسترسی یافت نشد")
        return permission
    }
}
module.exports = {
    PermissionController : new PermissionController()
}