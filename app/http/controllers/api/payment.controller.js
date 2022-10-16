const Controller = require("../controller");
const createError = require ("http-errors");
const axios = require("axios");
const { getBasketOfUser } = require("../../../utils/function");
const { assertValidExecutionArguments } = require("graphql/execution/execute");

class PaymentController extends Controller{
    async PaymentGateway(req , res , next){
        try {
            const user = req.user
            if(user.basket.courses.length == 0 && user.basket.products.length == 0) throw createError.BadRequest("سبد خرید شما خالی می باشد")
            const basket = (await getBasketOfUser(user._id))?.[0];
            if(!basket?.payDetail?.paymentAmount) throw createError.BadRequest("مشخصات پرداخت یافت نشد")
            const zarinpal_request_url = "https://api.zarinpal.com/pg/v4/payment/request.json";
            const zarinpalGatewayURL = "hhtp://www.zarinpal.com/pg/StartPay"
            const zarinpal_option = {
                merchant_id : process.env.ZARINPAL_MERCHANTID,
                amount : basket?.payDetail?.paymentAmount,
                description : "بابت خرید دوره یا محصولات",
                metadata : {
                    email : user?.email || "example@domin.com",
                    mobile : user.mobile
                },
                callback_url : "http://localhost:400/verify"
            }
            const RequestResult = await axios.post(zarinpal_request_url , zarinpal_option).then(result => result.data)
            if(RequestResult.data.code == 100 && RequestResult.data.authority){
                const {code , authority} = RequestResult.data
                return res.json({
                    cose , 
                    gatewayURL : `${zarinpalGatewayURL}/${authority}`
                })
            }
            throw createError.BadRequest("پارامترهای ارسال شده صحیح نمی باشد")
        } catch (error) {
            next(error)
        }
    }
}
module.exports = {
    PaymentController : new PaymentController()
}