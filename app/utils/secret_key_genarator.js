const crypto = require("crypto");
//http://www.tahlildadeh.com/ArticleDetails/%D8%A2%D9%85%D9%88%D8%B2%D8%B4-%D9%85%D8%A7%DA%98%D9%88%D9%84-Crypto-Node-js
const key = crypto.randomBytes(32).toString("hex").toUpperCase();
console.log(key);

//34F3A314F5FDEAB2910987D92CE4F6EDA2BE84859DF3005B7189A228CD7BB4EB
//19B4F1F0D368FF159532AF121AE795A3997EE820F7F9C1D07C03C9BCE7B4C3DB