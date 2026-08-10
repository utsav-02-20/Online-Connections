import express from 'express' ; 
import morgon from 'morgan' ; 
import authRouter from "./routes/auth.routes.js" ;  
import cookiesParser from 'cookies-parser';

const app = express() ; 
 
app.use(express.json()) ; 
app.use(morgon("dev")) ; 

// api calling from routers
app.use("/api/auth" , authRouter) ; 


export default app ; 