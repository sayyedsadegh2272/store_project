const { PaymentController } = require("../../http/controllers/api/payment.controller")
const { VerifyAccessToken } = require("../../http/middlewares/verifyAccessToken")

const router = require("express").Router()

router.post("/payment" ,VerifyAccessToken,PaymentController.PaymentGateway)
router.post("/verify" , () => {})
module.exports = {
    ApiPayment : router
}

// ----------- Shapark - bank melat 
// 1 . payment
//2. check Transaction
//3.verifyTransaction

//--------------- Zarinpal - digipay 
// 1 . payment
//2.verify