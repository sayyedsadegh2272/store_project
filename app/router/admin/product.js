const {ProductController} = require("../../http/controllers/admin/product/product.controller")
const { stringToArray } = require("../../http/middlewares/stringToArray");
const { uploadFile } = require("../../utils/multer");

const router = require("express").Router();
router.post("/add" ,uploadFile.array("image",10),stringToArray("tags" , "colors") ,ProductController.addProduct);
// 10 => max image you can upload
router.get("/list" , ProductController.getAllProducts);
router.get("/:id" , ProductController.getOneProduct);
router.delete("/remove/:id" , ProductController.removeProductById);
router.patch("/edit/:id" ,uploadFile.array("image",10),stringToArray("tags" , "colors"), ProductController.editProduct);

module.exports = {
    AdminApiProductRouter : router
}
