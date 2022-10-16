const createHttpError = require("http-errors");
const { StatusCodes:  HttpStatus} = require("http-status-codes");
const { CourseModel } = require("../../../../models/course");
const { deleteInvalidPropertyInObject } = require("../../../../utils/function");
const Controller = require("../../controller");
const { CourseController } = require("./course.controller");

class ChapterController extends Controller {
    async addChapter(req , res , next){
        try {
            const {id , title , text} = req.body;
            await CourseController.findCourseById(id);
            const saveChapterResult = await CourseModel.updateOne({_id : id}, {$push : {
                chapters : {title, text, episodes : []}
                // why update : whe have default chapter in course model empty array[]
                // why push : in course model chapters is a array
            }})
            if(saveChapterResult.modifiedCount == 0) throw createHttpError.InternalServerError("فصل افزوده نشد")
            return res.status(HttpStatus.CREATED).json({
                statusCode : HttpStatus.CREATED , 
                data : {
                    message : "فصل با موفقیت افزوده شد"
                }
            })
        } catch (error) {
            
        }
    }
    async chaptersOfCourse(req , res , next){
        try {
            const {courseID} = req.params
            const course = await this.getChapterOfCourse(courseID)
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
    async removeChapterById(req , res , next){
        try {
            const{chapterID} = req.params;
            await this.getOneChapter(chapterID);
            const removeChapterResult = await CourseModel.updateOne({"chapters._id" : chapterID} , {
                $pull : { // pull for delete a item in array
                    chapters : {
                        _id : chapterID
                    }
                }
            })
            if(removeChapterResult.modifiedCount == 0) throw createHttpError.InternalServerError("حذف فصل انجام نشد");
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data : {
                    message : "حذف فصل با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async updateChapterById(req , res , next){
        try {
            const {chapterID} = req.params;
            await this.getOneChapter(chapterID);
            const data = req.body
            deleteInvalidPropertyInObject(data , ["_id"])
            // _id the field we can't update its
            const updateChapterResult = await CourseModel.updateOne(
                {"chapters._id" : chapterID},
                //why this way ? the filed into another field
                {$set : {"chapters.$" : data} }
            )
            if(updateChapterResult.modifiedCount == 0) throw createHttpError.InternalServerError("به روز رسانی فصل انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK , 
                data : {
                    message : "حذف فصل با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async getChapterOfCourse(id){
        const chapters = await CourseModel.findOne({_id : id} , {chapters: 1 , title : 1})
        if(!chapters) throw createHttpError.NotFound("دوره ای با این شناسه یافت نشد")
        return chapters
    }
    async getOneChapter(id){
        const chapter = await CourseModel.findOne({"chapters._id" : id} , {"chapters.$" : 1})
        // search and show only chapter
        //.$ => if (if => id) true show chapters
        //.$ for test if
        if(!chapter) throw createHttpError.NotFound("فصلی با این شناسه یافت نشد")
        return chapter
    }
}

module.exports ={
    ChapterController : new ChapterController()
}