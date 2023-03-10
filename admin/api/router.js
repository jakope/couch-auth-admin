import express from 'express';
const router = express.Router();   
const createApiRouter = (couchAuth) => {
const users = couchAuth.userDB;
console.log("couchAuth.config.userModel",couchAuth.config.userModel);
const columns = couchAuth.config.userModel?.table || [
    {title:"id", field:"id"},  
    {title:"key", field:"key"},
    {title:"email", field:"doc.email",headerFilter:"input"},
    {title:"Signup", field:"doc.signUp.timestamp",sorter:"date"},
];
const details = couchAuth.config.userModel?.details || [
    {title:"id", field:"_id", type : "string"},
    {title:"name", field:"name", type : "string"},
    {title:"email", field:"email", type : "string"},
    {title:"Signup", field:"signUp.timestamp", type : "string"},
];
router.get("/users",async (req,res)=>{ 
    const list = await users.list({include_docs: true});
    list.rows.pop(); //remove designDOc;
    return res.json(list.rows);
})

router.get("/users/columns", async (req,res) => {
    return res.json(columns);
});

router.get("/users/:id",async (req,res)=>{
    users.get(req.params.id )
    const obj = await users.get(req.params.id);
    
    return res.json({data : obj, details : details});
});



router.post("/users/change-email",async (req,res)=>{
    console.log("post",req.body.user_id, req.body.newEmail);
    const user_id = req.body.user_id;
    const newEmail = req.body.newEmail;
    try {
        await couchAuth.changeEmail(user_id, newEmail,req);
        return res.json({});
    } catch (error) {
        console.log("error",error);
        return res.status(500).json(error);
    }
});

router.post("/users/change-password",async (req,res)=>{
    console.log("req",req.body)
    console.log("post",req.body.user_id, req.body.password);
    const user_id = req.body.user_id;
    const password = req.body.password;
    try {
        await couchAuth.changePassword(user_id, password);    
        return res.json({});
    } catch (error) {
        console.log("error",error);
        return res.status(500).json(error);
    }
});

router.post("/users/forgot-password",async (req,res)=>{
    console.log("req",req.body)
    console.log("post",req.body.email);
    const email = req.body.email;
    try {
        await couchAuth.forgotPassword(email, req);    
        return res.json({});
    } catch (error) {
        console.log("error",error);
        return res.status(500).json(error);
    }
});

return router;
}

export default createApiRouter;