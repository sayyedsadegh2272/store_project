const JWT = require("jsonwebtoken");
const createError = require ("http-errors");
const path = require("path");
const fs = require("fs");
const { UserModel } = require("../models/users");
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = require("./constans");
const redisClient = require("./init_redis");

function RandomNumberGenerator(){
    //we want with this function making random number for login in website
    return Math.floor((Math.random() * 90000) + 10000)
    /**
     *  Math is a built-in (internal) object that has properties and methods for mathematical constants and functions. It's not a function object.
     * The Math.floor() function always rounds down and returns the largest integer less than or equal to a given number.
     * 90000 => number between 10000 to 90000
     * 10000 => always number be 5 number
     */
}
function signAccessToken(userId){
    // we want make access token for login user
    return new Promise(async (resolve , reject)=>{
        //https://ditty.ir/courses/es6/promises/XGQw5#resolve-reject
        //we use promise for => making token spend time
        const user = await UserModel.findById(userId)
        const payload = {
            mobile : user.mobile
        };
        const option ={
            expiresIn : "1h"
        };
        JWT.sign(payload , ACCESS_TOKEN_SECRET_KEY , option , (err , token) =>{
            if(err) reject(createError.InternalServerError("خطا سرور"));
            resolve (token)
        })

    })
}
function signRefreshToken(userId){
    /**
     * when we by in website we go to payment page of bank 
     * when we pay bill we went to return to website for get thing we by it
     * but our token is ded ! so we need a new token 
     * and a nwe token can't like a first token ! 
     * so we need token and we don't have enter mobile and code for it 
     */
    return new Promise(async (resolve , reject)=>{
        //https://ditty.ir/courses/es6/promises/XGQw5#resolve-reject
        //we use promise for => making token spend time
        const user = await UserModel.findById(userId)
        const payload = {
            mobile : user.mobile
        };
        const option ={
            expiresIn : "1y" // this mean one year time of token
        };
        JWT.sign(payload , REFRESH_TOKEN_SECRET_KEY , option ,async (err , token) =>{
            if(err) reject(createError.InternalServerError("خطا سرور"));
            await redisClient.SETEX(String(userId), (365*24*60*60), token);
            /**
             * we want save refresh token in redis 
             * we use SETEX (set expires) for this 
             * it has 3 parameter userid for save every refresh token for users
             * scend parameter must be expires ! => in this 1 year 
             * three parameter is token
             */
            resolve (token)
        })

    })
}
function VerifyRefreshToken(token){
    return new Promise((resolve , reject) =>{
        JWT.verify(token , REFRESH_TOKEN_SECRET_KEY ,async (err , payload)=>{
            if(err) return next(createError.Unauthorized("وارد حساب کاربری خود شوید"))
            const {mobile} = payload || {};
            //if nat payload return empty object
            const user = await UserModel.findOne({mobile}, {password : 0 , otp : 0})
            if(!user) return next(createError.Unauthorized("حساب کاربری یافت نشد"))
            const refreshToken = await redisClient.get(user._id || "key_default");
            if(!refreshToken) reject(createError.Unauthorized("ورود به حساب کاربری انجام نشد"))
            /**
             * we have compar the token by token in redis
             * the token in redis save on user ...so we search by user id
             */
            if (token === refreshToken) return resolve(mobile);
            reject(createError.Unauthorized("ورود به حساب کاربری انجام نشد"))
    })
    })
}
function ListOfImagesFromRequest (files , fileUploadPath){
    if(files?.length > 0) {
        return ((files.map(file => path.join(fileUploadPath , file.filename))).map(item => item.replace(/\\/g , "/")))
    }else{
        return []
    }
}
function setFeatures(body){
    const {colors, width, weight, height, length } = body ; 
    let features = {};
    features.colors = colors;// we don't need any do work on colors!
    if(!isNaN(+width)|| !isNaN(+height) || !isNaN(+weight) || !isNaN(+length)){
        // + => covert to number if not number
        // is NaN => test is value not number return true => 
        if(!width) features.width = 0;
        else features.width = +width;
        if(!height) features.height = 0 ;
        else features.height = +height;
        if (!weight) features.weight = 0;
        else features.weight = +weight;
        if (!length) features.length = 0;
        else features.length = +length;
    }
    return features
}
function deleteFileInPublic(fileAddress){
    if(fileAddress) {
        const pathFile = path.join(__dirname , ".." , ".." , "public" , fileAddress)
        if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile)
        //existsSync check is folder created or nat ?
        //fs.unlinkSync(pathFile) delete link 
    /**
     * we use this function when we cerate a blog example
     * image or file of blog is right but other option like title false
     * image or file upload 
     * so we have delet image or file 
     */
    }
}
function deleteInvalidPropertyInObject(data = {} , blackListFields = []){
    //blackListFields => the fields we can't delete them
    let nullishData = ["" , " " , "0" , 0 , null , undefined]
    Object.keys(data).forEach(key => {
        if(blackListFields.includes(key)) delete data[key]
        if(typeof data[key] == "string") data[key] = data[key].trim();
        // for delete all space in string 
        if(Array.isArray(data[key]) && data[key].length > 0) data[key] = data[key].map(item =>item.trim());
        // delete space from the all array
        if(Array.isArray(data[key]) && data[key].length == 0) delete data[key];
        if(nullishData.includes(data[key])) delete data[key]
    })
}
function copyObject(object){
    return JSON.parse(JSON.stringify(object))
    /**
     *  JSON.parse => convert a data to object
     * JSON.stringify => convert a object to a json file
     */
}
function getTime(seconds){
    let total = Math.round(seconds) / 60;
    //The Math.round() method rounds a number to the nearest integer
    let [minutes , percent] = String(total).split(".")
    let second = Math.round((percent * 60) / 100).toString().substring(0 , 2)
    let hour = 0;
    if (minutes > 60) {
        total = minutes / 60
         let [h1, percent] = String(total).split(".");
         hour = h1,
         minutes = Math.round((percent * 60) / 100).toString().substring(0, 2);
    }
    if(String(hour).length ==1) hour = `0${hour}`
    if(String(minutes).length ==1) minutes = `0${minutes}`
    if(String(second).length ==1) second = `0${second}`
    
    return (hour + ":" + minutes + ":" +second)
}
function getTimeOfCourse(chapters = []){
    let time , hour , minute , second = 0 ;
    for(const chapter of chapters){
        if(Array.isArray(chapter?.episodes)) {
            for(const episode of chapter.episodes) {
                if(episode?.time) time = episode.time.split(":")// [hour, min, second]
                else time = "00:00:00".split(":")
                if(time.length == 3){
                    //if time has three item
                    second += Number(time[0]) * 3600 // convert hour to second
                    second += Number(time[1]) * 60 // convert minute to second
                    second += Number(time[2]) //sum second with seond
                }else if(time.length == 2){
                    // example : 05 : 23
                    second += Number(time[0]) * 60 // convert minute to second
                    second += Number(time[1]) //sum second with seond
                }
            }
        }
    }
    hour = Math.floor(second / 3600); //convert second to hour
    minute = Math.floor(second / 60) % 60; //convert second to mintutes
    second = Math.floor(second % 60); //convert seconds to second
    if(String(hour).length == 1) hour = `0${hour}`
    if(String(minute).length == 1) minute = `0${minute}`
    if(String(second).length == 1) second = `0${second}`
    return (hour + ":" + minute + ":" + second)
}
async function getBasketOfUser(userID, discount = {}){
    const userDetail = await UserModel.aggregate([
        {
            $match : { _id: userID }
        },
        {
            $project:{ basket: 1}
        },
        {
            $lookup: {
                from: "products",
                localField: "basket.products.productID",
                foreignField: "_id",
                as: "productDetail"
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "basket.courses.courseID",
                foreignField: "_id",
                as: "courseDetail"
            }
        },
        {
            $addFields : {
                "productDetail" : {
                    $function: {
                        body: function(productDetail, products){
                            return productDetail.map(function(product){
                                const count = products.find(item => item.productID.valueOf() == product._id.valueOf()).count;
                                const totalPrice = count * product.price
                                return {
                                    ...product,
                                    basketCount: count,
                                    totalPrice,
                                    finalPrice: totalPrice - ((product.discount / 100) * totalPrice)
                                }
                            })
                        },
                        args: ["$productDetail", "$basket.products"],
                        lang: "js"
                    }
                },
                "courseDetail" : {
                    $function: {
                        body: function(courseDetail){
                            return courseDetail.map(function(course){
                                return {
                                    ...course,
                                    finalPrice: course.price - ((course.discount / 100) * course.price)
                                }
                            })
                        },
                        args: ["$courseDetail"],
                        lang: "js"
                    }
                },
                "payDetail" : {
                    $function: {
                        body: function(courseDetail, productDetail, products){
                            const courseAmount =  courseDetail.reduce(function(total, course){
                                return total + (course.price - ((course.discount / 100) * course.price))
                            }, 0)
                            const productAmount =  productDetail.reduce(function(total, product){
                                const count = products.find(item => item.productID.valueOf() == product._id.valueOf()).count
                                const totalPrice = count * product.price;
                                return total + (totalPrice - ((product.discount / 100) * totalPrice))
                            }, 0)
                            const courseIds = courseDetail.map(course => course._id.valueOf())
                            const productIds = productDetail.map(product => product._id.valueOf())
                            return {
                                courseAmount,
                                productAmount,
                                paymentAmount : courseAmount + productAmount,
                                courseIds,
                                productIds
                            }
                        },
                        args: ["$courseDetail", "$productDetail", "$basket.products"],
                        lang: "js"
                    }
                },
            }
        },{
            $project: {
                basket: 0
            }
        }
    ]);
    return copyObject(userDetail)
}
module.exports = {
    RandomNumberGenerator,
    signAccessToken,
    signRefreshToken,
    VerifyRefreshToken,
    deleteFileInPublic ,
    ListOfImagesFromRequest ,
    setFeatures ,
    copyObject,
    deleteInvalidPropertyInObject,
    getTime,
    getTimeOfCourse,
    getBasketOfUser

}