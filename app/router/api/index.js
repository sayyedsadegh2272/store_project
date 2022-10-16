const homeController = require("../../http/controllers/api/home.controller");
const { VerifyAccessToken } = require("../../http/middlewares/verifyAccessToken");

const router = require ("express").Router();
/**
 * @swagger
 * /:
 *  get:
 *      summary: index of routes
 *      tags: [IndexPage]
 *      description: get all need data for index page
 *      parameters:
 *          -   in: header
 *              name: access-token
 *              example: Bearer YourToken...
 *      responses:
 *          200:
 *              description: success
 *              schema:
 *                  type: string
 *                  example: Index page Store
 *          404:
 *              description: not found
 */
router.get("/" ,VerifyAccessToken , homeController.indexPage);
module.exports = {
    HomeRoutes : router
}