const { checkPermission } = require("../../http/middlewares/permission.guard");
const { PERMISSIONS } = require("../../utils/constans");
const { AdminApiBlogRouter } = require("./blog");
const { AdminApiCategoryRouter } = require("./category");
const { AdminApiChapterRouter } = require("./chapter");
const { AdminApiCourseRouter } = require("./course");
const { AdminApiEpisodeRouter } = require("./episode");
const { AdminApiPermissionRouter } = require("./permission");
const { AdminApiProductRouter } = require("./product");
const { AdminApiRoleRouter } = require("./role");
const { AdminApiUserRouter } = require("./user");
const router = require("express").Router();

router.use("/category" ,checkPermission([PERMISSIONS.CONTENT_MANAGER]), AdminApiCategoryRouter)
router.use("/blogs" ,checkPermission([PERMISSIONS.TEACHER]), AdminApiBlogRouter)
router.use("/products" ,checkPermission([PERMISSIONS.SUPPLIER]), AdminApiProductRouter)
router.use("/courses" ,checkPermission([PERMISSIONS.TEACHER]), AdminApiCourseRouter)
router.use("/chapter" ,checkPermission([PERMISSIONS.TEACHER]), AdminApiChapterRouter)
router.use("/episode" ,checkPermission([PERMISSIONS.TEACHER]), AdminApiEpisodeRouter)
router.use("/user" , AdminApiUserRouter)
router.use("/permission" , checkPermission([PERMISSIONS.ADMIN]) , AdminApiPermissionRouter)
router.use("/role" , checkPermission([PERMISSIONS.ADMIN]) , AdminApiRoleRouter)
module.exports = {
    AdminRoutes: router
}
