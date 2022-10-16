const multer = require("multer");
const path = require("path");
const fs = require("fs")
const createError = require("http-errors");

function createRoute (req) {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.getMonth().toString();
    const day = date.getDate().toString();
    const directory = path.join(__dirname , ".." , ".." , "public" , "uploads" , "blogs" , year , month , day)
    req.body.fileUploadPath = path.join("uploads" , "blogs" , year , month , day)
    /**
     * می خواییم که شخص نتونه هر فایلی رو آپلود کنه فقط بتونه عکس های با فرمت مجاز رو بفرسته
     * بنابراین می یاییم یه فیلد جدید می سازیم 
     * سپس می ریم تو قسمت کنترل ها و می گیم 
     * req.body.image = req.body.filename
     */
    fs.mkdirSync(directory , {recursive : true})
    return directory 
}
const storage = multer.diskStorage({
    destination : (req , file , cb) =>{
       if(file.originalname){
        const filePath = createRoute(req);
        return cb(null , filePath)
       }
        cb(null , null)
    },
    filename : (req , file , cb) =>{
        if(file.originalname){
        const etx = path.extname(file.originalname);
        const fileName = String(new Date().getTime()+etx)
        req.body.filename = fileName
        return cb(null , fileName)
        }
        cb(null , null)
    }
});
function fileFilter(req , file , cb){
    const etx = path.extname(file.originalname)
    const mimeTypes = [".jpg" , ".jpeg" , ".png" , ".webp" , ".gif"]
    if(mimeTypes.includes(etx)){
        return cb(null,true)
    }
    return cb(createError.BadRequest("تصویر ارسال شده دارای فرمت مناسب نمی باشد"))
}
function videoFilter (req , file , cb){
    const etx = path.extname(file.originalname);
    const mimeTypes = [".mp4", ".mpg", ".mov", ".avi", ".mkv"];
    if(mimeTypes.includes(etx)){
        return cb(null , true)
    }
}
const pictureMaxSize = 1 * 1000 * 1000 // 1 mb
const videoMaxSize = 300 * 1000 * 1000; //300 mb
const uploadFile = multer({storage , fileFilter , limits : {fileSize : pictureMaxSize}});
const uploadVideo = multer({storage , videoFilter , limits : {fileSize : videoMaxSize}})
module.exports = {
    uploadFile , 
    uploadVideo
}