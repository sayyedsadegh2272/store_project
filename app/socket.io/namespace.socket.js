const path = require("path")
const fs = require("fs")
const { ConversationModel } = require("../models/conversation");


module.exports = class NamespaceSocketHandler {
    #io;
    constructor(io) {
        this.#io = io
    }
    initConnection() {
        this.#io.on("connection" , async (socket) =>{
            const namespaces = await ConversationModel.find({},{
                title : 1,
                endpoint : 1 ,
                rooms : 1
            }).sort({
                _id : -1
            })
            socket.emit("namespacesList" , namespaces)
        })
    }
    async createNamespacesConnection(){
        const namespaces = await ConversationModel.find({}, {
            title: 1,
            endpoint: 1,
            rooms: 1
        }).sort({
            _id: -1
        })
        for(const namespace of namespaces){
            // ما می خواییم اتصال به همه نیم اسپیس ها برقرار باشه 
            // تا مثلا وقتی که موس رفت روی هر کدوم اطلاعات هر کدوم بیاد و قابلیت اتصال به هر کدوم باشه
            this.#io.of(`/${namespace.endpoint}`).on("connection" , async (socket) => {
                const conversation = await ConversationModel.findOne({endpoint : namespace.endpoint} , {endpoint  : 1 , rooms : 1}).sort({_id : -1})
                // ما همه اطلاعات الان نمی خواییم فقط می خواییم مشخصات اتاق ها مثل تایتل و ... بگیریم
                // تا وقتی روی اون فضا کلیک می کنیم لیست اتاق ها بیاد
                socket.emit("roomList" , conversation.rooms)
                // اطلاعات اتاق ها رو ارسال کردیم 
                socket.on("joinRoom" , async roomName => {
                    // کلاینت درخواست اتصال به یکی از اتاق ها رو می ده 
                    // ما این درخواست رو باید هندل کنیم 
                    // به عنوان پارامتر اسم اون اتاقی که می خواد رو باید از کلاینت بگیریم
                    const lastRoom = Array.from(socket.rooms)[1]
                    //اگه تو یه اتاق دیگه ای از فضا بود باید اون رو ترک کنه 
                    if(lastRoom){
                        socket.leave(lastRoom)
                        await this.getCountOfOnlineUsers(namespace.endpoint , roomName)
                        // تعداد کاربران فعال رو باید همیشه داشته باشیم
                    }
                    socket.join(roomName)
                    // اگه قبلا به اتاقی متصل نشده بود بیا و به اتاقی که درخواست داده مستقیم متصل بشو
                    await this.getCountOfOnlineUsers(namespace.endpoint , roomName)
                    const roomInfo = conversation.rooms.find(item => item.name == roomName)
                    // چه طوری بدست بیارم ؟ می گه برو جستجو کن داخل آبجکت اون اتاقی رو که با اسم این اتاق برابر است
                    socket.emit("roomInfo" , roomInfo)
                    this.getNewMessage(socket)
                    this.getNewLocation(socket)
                    this.uploadFiles(socket)
                    // یعنی وقتی ما اتصال به اتاق برقرار کردیم همه ی متود های بالا
                    //که دریافت پیام یا لوکیشن یا فایل هست در دسترس هستند
                    socket.on("disconnect" , async()=>{
                        await this.getCountOfOnlineUsers(namespace.endpoint, roomName)
                        // اگه کلاینتی که از سوکت استفاده می کنه قطع اتصال بشه 
                        // فورا دوباره تعداد افراد آنلاین اتاق چک کن و. این کاربر ازش کم بشه
                    })

                })
            })
        }  
    }
    async getCountOfOnlineUsers(endpoint , roomName){
        const onlineUsers = await this.#io.of(`/${endpoint}`).in(roomName).allSocket()
        this.#io.of(`/${endpoint}`).in(roomName).emit("countOfOnlineUsers" , Array.from(onlineUsers).length)
    }
    getNewMessage(socket){
        socket.on("newMessage" , async data => {
            const {message , roomName , endpoint , sender} = data
            await ConversationModel.updateOne({endpoint , "rooms.name" : roomName} , {
                $push : {
                    "rooms.$.message" : {
                        sender , 
                        message , 
                        dateTime : Date.now()
                    }
                }
            })
            this.#io.of(`/${endpoint}`).in(roomName).emit("confirmMessage" , data)
            // هر پیامی که دریافت بشه از سمت کلاینت فورا ارسال می شه تا برای بقیه کاربرها هم نمایش داده بشه !
            // نکته دیگه اینکه این نوع ارسال از نوع برادکست هست ! یعنی معنای ارسال پیام به کلیه کلاینت های متصل است
        })
    }
    getNewLocation(socket){
        socket.on("newLocation" , async data => {
            const {location , roomName , endpoint , sender} = data
            await ConversationModel.updateOne({endpoint , "rooms.name" : roomName}, {
                $push  : {
                    "rooms.$.locations" : {
                        sender ,
                        location,
                        dateTime : Date.now()
                    }
                }
            })
            this.#io.of(`/${endpoint}`).in(roomName).emit("confirmLocation", data)
            //  به محض دریافت لوکیشن جدید فورا برای بقیه کاربر ها ارسال می شه 
        })
    }
    uploadFiles(socket){
        socket.on("upload" , ({file , filename} , callback) => {
            const etx = path.extname(filename)
            fs.watchFile("public/uploads/socket/" + String(Date.now() + etx) , file , (err)=> {
                callback({message : err ? "failure" : "success"})
            })
        })
    }
}