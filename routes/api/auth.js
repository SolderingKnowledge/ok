const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

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

module.exports = router;