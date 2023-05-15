import express from 'express'; 
import template from './users-template.js';
import createApiRouter from './api/router.js';
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
    return couchAuth;
}

export default init;