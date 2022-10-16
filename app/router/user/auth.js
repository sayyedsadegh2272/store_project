const { UserAuthController } = require("../../http/controllers/user/auth/auth.controller");

const router = require ("express").Router();
/**
 * @swagger
 *  components:
 *      schemas:
 *          GetOTP:
 *              type: object
 *              required:
 *                  -   mobile
 *              properties:
 *                  mobile:
 *                      type: string
 *                      description: the user mobile for signup/signin
 *          CheckOTP:
 *              type: object
 *              required:
 *                  -   mobile
 *                  -   code
 *              properties:
 *                  mobile:
 *                      type: string
 *                      description: the user mobile for signup/signin
 *                  code:
 *                      type: integer
 *                      description: reviced code from getOTP 
 *          RefreshToken:
 *              type: object
 *              required:
 *                  -   refreshToken
 *              properties:
 *                  refreshToken:
 *                      type: string
 *                      description: enter refresh-token for get fresh token and refresh-token
 */

/**
 * @swagger
 *  tags:
 *      name : User-Authentication
 *      description : user-auth section
 */
/**
 * @swagger
 *  /user/get-otp:
 *      post:
 *          tags: [User-Authentication]
 *          summary: login user in userpanel with phone number
 *          description: one time password(OTP) login
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/GetOTP'
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/GetOTP'
 *          responses:
 *              201:
 *                  description: success
 *              400:
 *                  description: bad Request
 *              401:
 *                  description: unauthorization
 *              500:
 *                  description: internal Server Error
 */
router.post("/get-otp" , UserAuthController.getOtp)
/**
 * @swagger
 *  /user/check-otp:
 *      post:
 *          tags: [User-Authentication]
 *          summary: check-otp value in user controller
 *          description: check otp with code-mobile and expires data
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/CheckOTP'
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CheckOTP'
 *          responses:
 *              201:
 *                  description: success
 *              400:
 *                  description: bad Request
 *              401:
 *                  description: unauthorization
 *              500:
 *                  description: internal Server Error
 */
router.post("/check-otp" , UserAuthController.checkOtp)
/**
 * @swagger
 *  /user/refresh-token:
 *      post:
 *          tags: [User-Authentication]
 *          summary: send refresh token ffor get new token and refresh token
 *          description : fresh token
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/RefreshToken'
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/RefreshToken'
 *          responses:
 *              200:
 *                  description : success
 */
router.post("/refresh-token" , UserAuthController.refreshToken)
module.exports = {
    UserAuthRoutes : router
}