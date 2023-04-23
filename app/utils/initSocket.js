const socketIO = require("socket.io")
function initialSocket(httpServer){
    const i0 = socketIO(httpServer , {
        cors : {
            origin : "*"
        },
        maxHttpBufferSize : 1e8
    })
    return i0
}
module.exports = {
    initialSocket
}