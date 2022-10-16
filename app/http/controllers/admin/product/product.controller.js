const Controller = require("../../controller");
const createError = require("http-errors");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { createProductSchema } = require("../../../validators/admin/product.schema");
const { setFeatures, ListOfImagesFromRequest, deleteInvalidPropertyInObject } = require("../../../../utils/function");
const { ProductModel } = require("../../../../models/products");
const { ObjectIdValidator } = require("../../../validators/public.validator");
const ProductBlackList = {
    BOOKMARKS: "bookmarks", // if we want freeze object the key must rename apercus(A , B , ...)
    LIKES: "likes",
    DISLIKES: "dislikes",
    COMMENTS: "comments",
    SUPPLIER: "supplier",
    WEIGHT: "weight",
    WIDTH: "width",
    LENGTH: "length",
    HEIGHT: "height",
    COLORS: "colors"
  }
  Object.freeze(ProductBlackList)//freeze method make a object to nat change 
class ProductController extends Controller {
    async addProduct(req , res , next){
        try {
            const images = ListOfImagesFromRequest(req?.files || [] , req.body.fileUploadPath);
            const productBody = await createProductSchema.validateAsync(req.body);
            const {title, text, short_text, category, tags, count, price, discount, type} = productBody;
            const supplier = req.user._id;
            let features = setFeatures(req.body)
            const product = await ProductModel.create({
                title,
                text,
                short_text,
                category,
                tags,
                count,
                price,
                discount,
                images,
                features,
                supplier,
                type
            });
            return res.status(HttpStatus.CREATED).json({
                statusCode : HttpStatus.CREATED , 
                data : {
                    message : "ثبت محصول با موفقیت انجام شد"
                }
            });

        } catch (error) {
            deleteFileInPublic(req.body.image)
            next(error)
        }
    } 
    async editProduct(req , res , next){
        try {
            const id = req.params;
            const product = await this.findProductById(id)
            const data = copyObject(req.body);
            data.images = ListOfImagesFromRequest(req?.files || [] , req.body.fileUploadPath);
            data.features = setFeatures(req.body);
            let blackListFields = Object.values(ProductBlackList);
            deleteInvalidPropertyInObject(data , blackListFields);
            // we use this for delete a fields empty or null or ..... when edit product
            const updateProductResult = await ProductModel.updateOne({_id : product._id} , {$set : data})
            if(updateProductResult.modifiedCount == 0 ) throw {status : HttpStatus.InternalServerError , message : "خطای داخلی "}
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK,
                data : {
                    message : "به روز رسانی با موفقیت انجام شد"
                }
            })
        } catch (error) {
            next(error)
        }
    } 
    async getAllProducts(req , res , next){
        try {
            const search = req?.query?.search || "" ;
            let products; 
            if(search){
                products = await ProductModel.find({
                    $text : {
                        $search : new RegExp(search , "ig")
                        // what is "ig" => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Deprecated_and_obsolete_features#regexp_properties
                    }
                })
            }else{
                products = await ProductModel.find({})
            }
            return res.status(HttpStatus.OK).json({
                statusCode : HttpStatus.OK,
                data : {
                    products
                }
            })
        } catch (error) {
            next(error)
        }
    } 
    async getOneProduct(req , res , next){
        try {
            const {id} = req.params;
            const product = await this.findProductById(id)
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK , 
                data : {
                    product
                }
            })
        } catch (error) {
            next(error)
        }
    } 
    async removeProductById(req , res , next){
        try {
            const {id} = req.params;
            const product = await this.findProductById(id);
            const removeProductResult = await ProductModel.deleteOne({_id : product._id});
            if(removeProductResult.deletedCount == 0) throw createError.InternalServerError("حذف محصول انجام نشد");
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK , 
                data : {
                    product
                } 
            })
        } catch (error) {
            next(error)
        }
    } 
    async findProductById(productID){
        const {id} = await ObjectIdValidator.validateAsync({id : productID});
        const product = await ProductModel.findById(id);
        if(!product) throw new createError.NotFound("محصولی یافت نشد")
        return product
    } 
}
module.exports = {
    ProductController : new ProductController(),
};