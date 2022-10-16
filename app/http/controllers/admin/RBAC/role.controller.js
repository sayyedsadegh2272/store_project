const createHttpError = require("http-errors");
const { StatusCodes:  HttpStatus} = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const { RoleModel } = require("../../../../models/role");
const { copyObject, deleteInvalidPropertyInObject } = require("../../../../utils/function");
const { addRoleSchema } = require("../../../validators/admin/RBAC.schema");
const Controller = require("../../controller");

class RoleController extends Controller {
    async getAllRoles(req , res , next){
        try {
            const roles = await RoleModel.find({});
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data:{
                    roles
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async createNewRole(req, res , next){
        try {
            const{title , permissions} = await addRoleSchema.validateAsync(req.body);
            await this.findRoleWithTitle(title)
            const role = await RoleModel.create({title , permissions})
            if(!role) throw createHttpError.InternalServerError("نقش ایجاد نشد")
            return res.status(HttpStatus.CREATED).json({
                statusCode : HttpStatus.CREATED,
                data : {
                    message : "ایجاد نقش با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async removeRole(req, res , next){
        try {
            const {field} = req.params
            // in prams we can send id or name of role
            const role = await this.findRoleWithIdOrTitle(field)
            const removeRoleResult = await RoleModel.deleteOne({_id : role._id});
            if(!removeRoleResult.deletedCount) throw createHttpError.InternalServerError("حذف نقش انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK,
                data : {
                    message : "حذف نقش با موفقیت انجام نشد"
                }
            }) 
        } catch (error) {
            next(error)
        }
    }
    async updateRoleByID(req , res , next){
        try {
            const {id} = req.params
            const role = await this.findRoleWithIdOrTitle(id)
            const data = copyObject(req.body)
            deleteInvalidPropertyInObject(data , [])
            const updateRoleResult = await RoleModel.updateOne({_id : id} , {
                $ste : data
            })
            if(!updateRoleResult.modifiedCount) throw createHttpError.InternalServerError("ویرایش نقش انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK,
                data : {
                    message : "ویرایش نقش با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async findRoleWithTitle(title){
        // we use this when we want make new role and we want sure the new role not cerated
        const role = await RoleModel.findOne({title});
        if(role) throw createHttpError.BadRequest("نقش یا رول قبلا ثبت شده است")
    }
    async findRoleWithIdOrTitle(field){
        let findQuery = mongoose.isValidObjectId(field)? {_id : field}:{title : field}
        // if findQuery 
        const role = await RoleModel.findOne(findQuery)
        if(!role) throw createHttpError.NotFound("نقش مورد نظر یافت نشد")
        return role
    }
}
module.exports = {
    RoleController : new RoleController()
}
