const express = require ("express");
const morgan = require ("morgan");
const { createServer } = require("http");
require("dotenv").config();
const mongoose = require ("mongoose");
const path = require("path");
const createError = require("http-errors");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cors = require("cors")
const { AllRoutes } = require("./router/router");

module.exports = class Application {
    #app = express()
    #DB_URL;
    #PORT;
    constructor(PORT , DB_URL) {
        this.#PORT = PORT;
        this.#DB_URL = DB_URL;
        this.configApplication();
        this.initRedis();
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
        http.createServer(this.#app).listen(this.#PORT , ()=>{
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
    initRedis(){
        require("./utils/init_redis")
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
