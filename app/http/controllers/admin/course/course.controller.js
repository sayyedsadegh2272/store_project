const { CourseModel } = require("../../../../models/course");
const Controller = require("../../controller");
const {StatusCodes: HttpStatus} = require("http-status-codes");
const path = require("path");
const createHttpError = require("http-errors");
const { createCourseSchema } = require("../../../validators/admin/course.schema");
const { default: mongoose } = require("mongoose");
const { copyObject, deleteInvalidPropertyInObject } = require("../../../../utils/function");
class CourseController extends Controller{
    async getListOfCourse(req , res , next){
        try {
            const{search} = req.query
            let courses;
            //why let ? because we want agin into value if not search


            if(search) courses = await CourseModel
            .find({$text : {$search : search}})
            .populate([
                {path : "category" , select: {title}},
                {path : "teacher" , select : {first_name : 1 , last_name:1 , mobile:1, email: 1}}
            ])
            .sort({_id : -1})
            else courses = await CourseModel.find({})
            .populate([
                {path : "category" , select : {children : 0 , parent : 0}},
                {path : "teacher" , select : {first_name : 1 , last_name:1 , mobile:1, email: 1}}
            ])
            .sort({_id : -1})
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK ,
                data : {
                    courses
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async addCourse(req , res , next){
        try {
            await createCourseSchema.validateAsync(req.body);
            const {fileUploadPath , filename} = req.body
            const image = path.join(fileUploadPath , filename).replace(/\\/g , "/")
            let {title, short_text, text, tags, category, price, discount = 0, type, discountedPrice} = req.body;
            const teacher = req.user._id
            if(Number(price) > 0 && type === "free" )throw createHttpError.BadRequest("برای دوره رایگان نمی توان قیمت تعیین کرد");
             const course = await CourseModel.create({
                title, 
                short_text, 
                text, 
                tags, 
                category, 
                price, 
                discountedPrice,
                discountStatus : false,
                discount, 
                type,
                image,
                status: "notStarted",
                teacher 
             })
             if(!course._id) throw createHttpError.InternalServerError("دوره ثبت نشد")
             return res.status(HttpStatus.CREATED).json({
                statusCode : HttpStatus.CREATED , 
                data : {
                    message : "دوره با موفقیت ایجاد شد"
                }
             })
        } catch (error) {
            next(error)
        }
    }
    async getCourseById(req , res , next){
        try {
            const {id} = req.params
            const course = await CourseModel.findById(id);
            if(!course) throw createHttpError.NotFound("دوره ای یافت نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK ,
                data : {
                    course
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async updateCourseById(req , res , next){
        try {
            const {id} = req.params
            const course = await this.findCourseById(id)
            const data = copyObject(req.body)
            const {filename , fileUploadPath} = req.body
            let blackListFields = ["time", "chapters", "episodes", "students", "bookmarks", "likes", "dislikes", "comments", "fileUploadPath", "filename"];
            // you can not chang filename , fileUploadPath in database
            deleteInvalidPropertyInObject(data , blackListFields)
            if(req.file){
                // if you want to change image ao course
                data.image = path.join(fileUploadPath , filename)
                deleteFileInPublic(course.image)
                // whit this function we delete the last image in database for upload new image
            }
            const updateCourseResult = await CourseModel.updateOne({_id : id} , {
                $set : data
            })
            if(!updateCourseResult.modifiedCount) throw new createHttpError.InternalServerError("به روز رسانی دوره انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data : {
                    message : "به روز رسانی دوره با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async findCourseById(id){
        if(!mongoose.isValidObjectId(id)) throw createHttpError.BadRequest("شناسه ارسال شده صحیح نمی باشد");
        const course = await CourseModel.findById(id);
        if(!course) throw createHttpError.NotFound("دوره ای یافت نشد");
        return course
    }
    async changeCourseDiscountStatus(req , res , next){
        try {
            
        } catch (error) {
            next(error)
        }
    }
}
module.exports = {
    CourseController : new CourseController()
}