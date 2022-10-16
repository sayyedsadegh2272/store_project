const createHttpError = require("http-errors");
const { StatusCodes:  HttpStatus} = require("http-status-codes");
const { CourseModel } = require("../../../../models/course");
const { deleteInvalidPropertyInObject, getTime, copyObject } = require("../../../../utils/function");
const Controller = require("../../controller");
const path = require("path");
const { createEpisodeSchema } = require("../../../validators/admin/course.schema");
const { default: getVideoDurationInSeconds } = require("get-video-duration");
const { ObjectIdValidator } = require("../../../validators/public.validator");

class EpisodeController extends Controller{
    async addNewEpisode (req , res , next){
        try {
            const {
                title,
                text,
                type,
                chapterID,
                courseID,
                filename,
                fileUploadPath
            } = await createEpisodeSchema.validateAsync(req.body);
            const fileAddress = path.join(fileUploadPath , filename)
            const videoAddress = fileAddress.replace(/\\/g , "/");
            const videoURL = `${process.env.BASE_URL} : ${process.env.APPLICATION_PORT}/${videoAddress}`
            const seconds = await getVideoDurationInSeconds(videoURL);
            let time = getTime(seconds); // for get time for save 
            const episode = {
                title,
                text,
                type,
                time,
                videoAddress
            }
            const cerateEpisodeResult = await CourseModel.updateOne({
                _id : courseID ,
                "chapters._id" : chapterID
            } , {
                $push : {
                    "chapters.$.episodes":episode
                }
            });
            if(cerateEpisodeResult.modifiedCount == 0)
                throw new createHttpError.InternalServerError("افزودن اپیزود انجام نشد")
            return res.status(HttpStatus.CREATED).json({
                statusCode : HttpStatus.CREATED ,
                data : {
                    message : "افزودن اپیزود با موفقیت انجام شد"
                }
            })

        } catch (error) {
            next(error)
        }
    }
    async removeEpisode(req , res , next){
        try {
            const {id : episodeID} = await ObjectIdValidator.validateAsync({ id : req.params.episodeID})
            // for ObjectIdValidator we have send that a object { id : req.params.episodeID}
            // id get from ObjectIdValidator rename episodeID
            await this.getOneEpisode(episodeID)
            const removeEpisodeResult = await CourseModel.updateOne({
                "chapters.episodes._id" : episodeID
            } , {
                $pull : {
                    "chapters.$.episodes" : {
                        _id : episodeID
                    }
                }
            });
            if(removeEpisodeResult.modifiedCount == 0)
                throw new createHttpError.InternalServerError("حذف اپیزود انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK,
                data : {
                    message : "حذف اپیزود با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async updateEpisode(req , res , next) {
        try {
            const {episodeID} = req.params;
            const episode = await this.getOneEpisode(episodeID)
            const {filename , fileUploadPath} = req.body
            let blackListFields = ["_id"] // the field we can"t chang it 
            if(filename && fileUploadPath){// if we want chang video of episode
                const fileAddress = path.join(fileUploadPath , filename)
                req.body.videoAddress = fileAddress.replace(/\\/g , "/")
                const videoURL = `${process.env.BASE_URL} : ${process.env.APPLICATION_PORT}/${req.body.videoAddress}`
                const seconds = await getVideoDurationInSeconds(videoURL)
                req.body.time = getTime(seconds);
                blackListFields.push("filename")
                blackListFields.push("fileUploadPath")
                //when change ... you can not change filename and fileUploadPath 
            }
            else{
                // if you don't want change the video of episode
                blackListFields.push("time")
                blackListFields.push("videoAddress")
            }
            const data = req.body // lets go foe update 
            deleteInvalidPropertyInObject(data , blackListFields)
            // if in req.body you send a blackListFields or a empty field or null or .....delete them
            const newEpisode = {
                ...episode,
                ...data
                // we use Override to change 
                //Override mean : rename (رونوشت کردن یه آبجکت )
            }
            const editEpisodeResult = await CourseModel.updateOne({
                "chapters.episodes._id" : episodeID
            } , {
                $set : {
                    "chapters.$.episodes" : newEpisode
                }
            })
            if(!editEpisodeResult.modifiedCount)// mean => modifiedCount == 0
                throw new createHttpError.InternalServerError("ویرایش اپیزود انجام نشد")
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK ,
                data : {
                    message : "ویرایش اپیزود با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async getOneEpisode(episodeID){
        const course = await CourseModel.findOne({"chapters.episodes._id" : episodeID} , {
            "chapters.$episodes" : 1
        })
        if(!course) throw new createHttpError.NotFound("اپیزودی یافت نشد")
        const episode = await course?.chapters?.[0]?.episodes?.[0]
        if(!episode) throw new createHttpError.NotFound("اپیزودی یافت نشد")
        return copyObject(episode) 
    }
}
module.exports = {
    EpisodeController : new EpisodeController()
}