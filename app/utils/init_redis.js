// const redisDB = require("redis");
// const redisClient = redisDB.createClient({
//     url: 'redis://127.0.0.1:6364'
// });
// /**
//  * for connect redis to server
//  * docker exec -it redis1(name if redis) sh
//  * redis-server
//  */

// redisClient.on("connect", () => console.log("connect to redis"));
// redisClient.on("ready", () => console.log("connected to redis and ready to use..."));
// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// redisClient.on("end", () => console.log("disconnected from redis...."))

// module.exports = redisClient