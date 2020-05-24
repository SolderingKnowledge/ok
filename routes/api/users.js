const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
// validation is usefull usually when input fields are empty
const { check, validationResult } = require("express-validator");
const config = require("config");
const User = require("../../models/User");

router.post("/", [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({ min: 6 }),
], async (req, res) => {
    console.log("req.body", req.body);
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({myErrors: error.array() });
    }
    // req.body.name => destructuring
    const { name, email, password } = req.body;
    try{
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({errors: [{ msg: "This is taken!" }]})
        }
        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm",
        })
        user = new User({
            name,
            email,
            avatar,
            password
        })
        const salt = await bcrypt.genSalt(10);
        // hashing password with bcrypt
        user.password = await bcrypt.hash(password, salt);
        await user.save();

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

// route        GET api/users
// description  send dummy message
// access       Public
router.get("/", (req, res) => {
    return res.send("User route")
});

module.exports = router;