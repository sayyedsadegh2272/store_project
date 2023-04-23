const { UserModel } = require("../../../models/users");
const { signAccessToken } = require("../../../utils/function");
const Controller = require("../controller");


class SupportController extends Controller {
    loginForm(req , res , next){
        try {
            return res.render("login.ejs" , {
                error : undefined
            })
        } catch (error) {
            next(error)
        }
    }
    async login(req , res , next){
        try {
            const {mobile} = req.body
            const user = await UserModel.findOne({mobile})
            if(!user){
                return res.render("login.ejs" , {
                    error : "نام کاربری صحیح نمی باشد"
                })
            }
            const token = await signAccessToken(user._id);
            res.cookie("authorization" , token , {signed : true , httpOnly: true, expires: new Date(Date.now() + 1000*60*60*1)})
            /*
                قراره توکن کاربر رو در کوکی اون در سمت فرانت ذخیره کنیم 
                آپشن سایند می یاد و مقدار توکن رو هش می کنه
                اچ تی پی فقط یعنی سخت باشه دسترسی باشه 
                اکسپایر هم که یعنی تاریخ انقضا این سیو تا کی باشه 
            */
           user.token = token;
           user.save();
           return res.redirect("/support")
        } catch (error) {
            next(error)
        }
    }
    renderChatRoom(req , res , next) {
        try {
            return res.render("chat.ejs")
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    SupportController: new SupportController()
}