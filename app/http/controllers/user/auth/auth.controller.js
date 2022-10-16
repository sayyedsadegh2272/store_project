const createError = require("http-errors");
const { UserModel } = require("../../../../models/users");
const { ROLES } = require("../../../../utils/constans");
const { RandomNumberGenerator, signAccessToken, VerifyRefreshToken, signRefreshToken } = require("../../../../utils/function");
const {getOtpSchema , checkOtpSchema } = require("../../../validators/user/auth.schema");
const Controller = require("../../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");

class UserAuthController extends Controller{
    async getOtp(req , res , next){
        try {
            await getOtpSchema.validateAsync(req.body);
            const {mobile} = req.body;
            const code = RandomNumberGenerator();
            const result = await this.saveUser(mobile , code)
            if(!result)throw createError.Unauthorized("ورود شما با خطا مواجه شد")
            return res.status(HttpStatus.OK).send({
                statusCode : HttpStatus.OK , 
                data:{
                    message : "کد اعتبار سنجی با موفقیت برای شما ارسال شد" ,
                    code , 
                    mobile
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async checkOtp(req , res , next){
        try {
            await checkOtpSchema.validateAsync(req.body)
            const{mobile , code} = req.body;
            const user = await UserModel.findOne({mobile});
            if(!user) throw createError.NotFound("کاربری یافت نشد")
            if(user.otp.code != code) throw createError.Unauthorized("کد ارسال شده صحیح نمی باشد");
            const now = Date.now();
            if(+user.otp.expiresIn < now) throw createError.Unauthorized("کد شما منقضی شده است");
            // + mean => we change format to number wit +
            const accessToken = await signAccessToken(user._id)
            const refreshToken = await signRefreshToken(user._id);
            return res.json({
                data : {
                    accessToken,
                    refreshToken
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async refreshToken(req , res , next){
        /**
     * when we by in website we go to payment page of bank 
     * when we pay bill we went to return to website for get thing we by it
     * but our token is ded ! so we need a new token 
     * and a nwe token can't like a first token ! 
     * so we need token and we don't have enter mobile and code for it 
     */
        const {refreshToken} = req.body
        const mobile = await VerifyRefreshToken(refreshToken);
        const user = await UserModel.findOne({mobile})
        const accessToken = await signAccessToken(user._id);
        const newRefreshToken = await signRefreshToken(user._id);
        return res.json({
            data : {
                accessToken ,
                refreshToken : newRefreshToken
            }
        })
    }
    async saveUser(mobile , code){
        let otp = { // let why ? because every time user login we have save information
            code ,
            expireIn : (new Date().getTime() + 120000)
        }
        const result = await this.checkExitUser(mobile);
        if(result){
            return (await this.updateUser(mobile , {otp}))
            // user "sign in" in past and we update her/she information 
        }
        return !!(await UserModel.create({
            //user  not"sign in" in past and we create a new account for her/she
            mobile , 
            otp ,
            Roles : ROLES.USER
        }))
    }
    async checkExitUser(mobile){
        const user = await UserModel.findOne({mobile});
        return !!user
    }
    async updateUser(mobile , objectData = {}){
        Object.keys(objectData).forEach(key =>{
            if(["" , " " , 0 , null , undefined , "0" , NaN].includes(objectData[key])) delete objectData[key]
        })
        const updateResult = await UserModel.updateOne({mobile} , {$set : objectData})
        return !!updateResult.modifiedCount
        /**
         * if modifiedCount more than 0 =>return true 
         * if modifiedCount == 0 => return false
         */
    }
}
module.exports = {
    UserAuthController : new UserAuthController()
}