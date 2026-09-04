import dotenv from "dotenv" ; 

dotenv.config() ; 

if(!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variable") ; 
}
if(!process.env.DB_NAME) {
    throw new Error("DB_NAME is not defined in environment variable") ; 
}
if(!process.env.PORT) {
    throw new Error("PORT is not defined in environment variable") ; 
}
if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variable") ; 
}


const config = {
    MONGO_URI: process.env.MONGODB_URI , 
    DB_NAME: process.env.DB_NAME, 
    PORT: process.env.PORT,
    JWT_SECRET : process.env.JWT_SECRET,
}

export default config ;