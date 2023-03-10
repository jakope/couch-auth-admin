import express from 'express'; 
import template from './users-template.js';
import createApiRouter from './api/router.js';
import createNano from './nano-helper.js';
const router = express.Router();

router.get("/",async (req,res)=>{
    res.setHeader("Content-Type", "text/html")
    res.send(template);
    //res.render("admin/login");
});

router.get("/users",async (req,res)=>{
    res.setHeader("Content-Type", "text/html")
    res.send(template);
}); 



const init = (couchAuth) => {
    const apiRouter = createApiRouter(couchAuth)
    router.use("/api",apiRouter);
    couchAuth.adminRouter = router;
    const { protocol, user,password, host} = couchAuth.config.dbServer;
    
    const url = protocol + user + ":" + password + "@" + host;
    console.log("init host",url);
    couchAuth.nano = createNano(url);
    return couchAuth;
}

export default init;