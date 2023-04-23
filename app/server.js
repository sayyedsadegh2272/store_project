const express = require ("express");
const morgan = require ("morgan");
const ExpressEjsLayouts = require("express-ejs-layouts")
require("dotenv").config();
const mongoose = require ("mongoose");
const path = require("path");
const createError = require("http-errors");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cors = require("cors")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const { AllRoutes } = require("./router/router");
const { initialSocket } = require("./utils/initSocket");
const { socketHandler } = require("./socket.io");
const { clientHelper } = require("./utils/client");
const { COOKIE_PARSER_SECRET_KEY } = require("./utils/constans");

module.exports = class Application {
    #app = express()
    #DB_URL;
    #PORT;
    constructor(PORT , DB_URL) {
        this.#PORT = PORT;
        this.#DB_URL = DB_URL;
        this.configApplication();
        this.initTemplateEngine();
        // this.initRedis();
        this.connectToMongoDB();
        this.createServer();
        this.createRoutes();
        this.errorHandling();
    }
    configApplication(){
        this.#app.use(cors());
        this.#app.use(morgan("dev"));
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({extended : true}));
        this.#app.use(express.static(path.join(__dirname , ".." , "public")));
        this.#app.use(
            "/api-doc",
            swaggerUI.serve,
            swaggerUI.setup(
              swaggerJsDoc({
                swaggerDefinition: {
                  openapi: "3.0.0",
                  info: {
                    title: "Boto Start Store",
                    version: "2.0.0",
                    description:
                      "بزرگترین مرجع آموزش برنامه نویسی و فروش محصولات جذاب برای برنامه نویسان",
                    contact: {
                      name: "Sadegh Ashkavand",
                      url: "https://freerealapi.com",
                      email: "sadeghashkavand22@gmail.com",
                    },
                  },
                  servers: [
                    {
                      url: "http://localhost:4000",
                    },
                    {
                      url: "http://localhost:5000",
                    },
                  ],
                  components : {
                    securitySchemes : {
                      BearerAuth : {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                        
                      }
                    }
                  },
                  security : [{BearerAuth : [] }]
                },
                apis: ["./app/router/**/*.js"],
              }),
              {explorer: true},
            )
          );
    }
    createServer(){
        const http = require("http");
        const server = http.createServer(this.#app)
        const io = initialSocket(server)
        socketHandler(io)
        server.listen(this.#PORT , ()=>{
            console.log("run => http://localhost:" + this.#PORT);
        })
    }
    connectToMongoDB(){
        mongoose.connect(this.#DB_URL , (error) => {
            if(!error) return console.log("connected to MongoDB");
            return console.log(error.message);
        })
        mongoose.connection.on("connected" , ()=>{
            console.log("mongoose connected to DB");
        //this is one of mongoose even !
        // and use for when we connect to db
        })
        mongoose.connection.on("disconnected" , ()=>{
            console.log("mongoose connection is disconnected");
            //this is one of mongoose even !
        // and use for when we can't connect to db
        })
        process.on("SIGINT", async() => {
            //when application close or crash or error 
            // this is disconnect mongoose to DB
            await mongoose.connection.close();
            process.exit(0)
            //this The process.exit() method instructs Node.js to terminate the process synchronously with an exit status of code
        }) 
    }
    // initRedis(){
    //     require("./utils/init_redis")
    // }
    initTemplateEngine(){
      this.#app.use(ExpressEjsLayouts)
      this.#app.set("view engine" , "ejs")
      this.#app.set("views" , "resource/views")
      this.#app.set("layout extractStyles", true);
      // for read css file 
      this.#app.set("layout extractScripts", true);
      // for read script file
      this.#app.set("layout", "./layouts/master");
      this.#app.use((req , res , next) => {
        this.#app.locals = clientHelper(req , res);
        next()
      })
         /*
        فرض کن در داخل پیام رسان ، یه کاربر می یاد و یه پیام ارسال می کنه 
        ما می خواییم اگه خود کاربر باشه سمت چپ بیاد پیامش 
        و اگه بقیه کاربر ها باشه سمت راست 
        پس باید اطلاعات اون کاربری که الان داره پیام ارسال می کنه رو داشته باشم 
        این کلاینت هلپر دقیقا کارش همینه 
      */
    }
    initClientSession(){
      this.#app.use(cookieParser(COOKIE_PARSER_SECRET_KEY))
      this.#app.use(session({
        secret : COOKIE_PARSER_SECRET_KEY,
        resave : true ,
        saveUninitialized : true ,
        cookie : {
          secure : true
        }
      }))
      /*
        برای اینکه بتونیم در سمت فرانت بدون کوئری زدن به دیتابیس
        توکن ذخیره کنیم و بررسی کنیم کاربر رو 
        می یاییم و از این قابلیت استفاده می کنیم
        و برای کانفیگ اون موارد بالا رو رعایت می کنیم
      */
    }
    createRoutes(){
        this.#app.use(AllRoutes)
    }
    errorHandling(){
        this.#app.use((req , res , next)=>{
            next(createError.NotFound("آدرس مد نظر یافت نشد"))
        })
        this.#app.use((req , res , next)=>{
            return res.status(404).json({
                statusCode : 404,
                message : "آدرس مورد نظر یافت نشد"
            })
        })
        this.#app.use((error , req  , res , next ) =>{
            const serverError = createError.InternalServerError()
            const statusCode = error.status || serverError.status ;
            const message = error.message || serverError.message ;
            return res.status(statusCode).json({
              errors : {
                statusCode ,
                message
              }
            })
    
        })
    }
}
