const {StatusCodes: HttpStatus} = require("http-status-codes");
const path = require("path");
const createHttpError = require("http-errors");
const Controller = require("../../controller");
const { deleteInvalidPropertyInObject } = require("../../../../utils/function");
const { UserModel } = require("../../../../models/users");

class UserController extends Controller {
    async getAllUsers(req , res , next) {
        try {
            const {search} = req.query; // we use query because maybe he wants all user with name sadegh
            const databaseQuery = {};
            if(search) databaseQuery['$text'] = {$search : search}
            // ['$text'] make a text field in databaseQuery == search the data into search property
            const users = await UserModel.find(databaseQuery);
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK,
                data : {
                    users
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async updateUserProfile(req , res , next){
        try {
            const userID = req.user._id
            const data = req.body
            const BlackListFields = ["mobile", "otp", "bills", "discount", "Roles", "Courses"]
            deleteInvalidPropertyInObject(data , BlackListFields)
            const profileUpdateResult = await UserModel.updateOne({_id : userID} , {$set : data})
            if(!profileUpdateResult.modifiedCount) throw new createHttpError.InternalServerError("به روز رسانی انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK ,
                data : {
                    message : "به روز رسانی پروفایل با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async userProfile(req , res , next){
        try {
            const user = req.user;
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: {
                    user
                }
            })
        } catch (error) {
            
        }
    }
}
module.exports = {
    UserController : new UserController()
}