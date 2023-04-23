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
}