
const { blogApiPrisma } = require("./prisma-api/blog.api");
const { CategoryApiPrisma } = require("./prisma-api/category");
const redisClient = require("../utils/init_redis");
const { AdminRoutes } = require("./admin/admin.routes");
const { HomeRoutes } = require("./api");
const { DeveloperRoutes } = require("./developer.router");
const { UserAuthRoutes } = require("./user/auth");
const { VerifyAccessToken } = require("../http/middlewares/verifyAccessToken");
const { graphqlHTTP } = require("express-graphql");
const { graphQlConfig } = require("../utils/graphql.config");
const { SupportSectionRouter } = require("./support/support.router");


// (async () =>{
//     await redisClient.connect();
//     await redisClient.set('key', 'value');
//     const value = await redisClient.get('key');
//     console.log(value);
// })()

const router = require("express").Router();
router.use("/user" , UserAuthRoutes)
router.use("/admin" ,VerifyAccessToken ,AdminRoutes)
router.use("/developer" , DeveloperRoutes)
router.use("/blogs" , blogApiPrisma)
router.use("/category" , CategoryApiPrisma)
router.use("/graphql" , graphqlHTTP(graphQlConfig))
router.use("/support" , SupportSectionRouter)
router.use("/" , HomeRoutes)


module.exports = {
    AllRoutes : router
}