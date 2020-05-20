const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const {check, validationResult} = require("express-validator");

const User = require("../../models/User");

// by attaching middleware "auth" all routes are going to be protected;
router.get("/", auth, async (req, res) => {
    try{
        // const user = await (await User.findById(req.user.id)).isSelected("-pasword");// true
        const user = await User.findById(req.user.id).select("-password");// json data
        res.json(user);
        // return res.send("Authenication route is validated route")
    }catch(error){
        console.log("error in catch", error.message);
        res.status(500).send("Server failed");
    }
});
// POST api/auth
router.post("/", [
    // check("name", "Name is required").not().isEmpty(),
    check("email", "Email is required").isEmail(),
    // check("password", "Password is required").isLength({ min: 6 }),
    check("password", "Password is required").exists(),
], async (req, res) => {
    console.log("req.body", req.body);
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({myErrors: error.array() });
    }
    // req.body.name => destructuring
    const { email, password } = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({errors: [{ msg: "Credentials are wrong" }]})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({error: [{message: "Wrong credentials"}]})
        }
        const payload = {
            user: {
                // id: user._id => mongodb has _id:
                id: user.id// mongoose uses absctraction
            }
        }
        jwt.sign(payload, config.get("jwtToken"), { expiresIn: 360000}, (err, token)=> {
            if(err) throw err;
            res.json({ token });
        });
        // res.send("Yay!! Successfully validated!")
    }catch(error){
        console.log("Error in catch", error.message);
        res.status(500).send(`Server failed: ${error.message}`);
    }
})

module.exports = router;