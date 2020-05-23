const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Profile = require("../../models/Profile");

// route:           GET api/profile/me
// description:     get current user profile
// access:          Private
router.get("/me", auth, async (req, res) => {
    try{
        // get profile it's mongoose job to get it for us
        const profile = await Profile.findOne({ user: req.user.id }).populate("user", ["name", "avatar"]);
        if(!profile) return res.status(400).json({message: "No profile for this user found!"});
        res.json(profile);
    }catch(error){
        // console.error(err.message);
        console.log("error in catch", error.message);
        res.status(500).send("Server failed");
    }
})

// route:           POST api/profile
// description:     create or update user profile
// access:          Private
router.post("/", [auth, 
    check("status", "Status is required").not().isEmpty(),
    check("skills", "Skills is required").not().isEmpty(),
], async (req, res) => {
    // check for errors
    const errors = validationResult(req);
    if(!errors) return res.status(400).json({ errors: errors.array() });
    const { company, website, location, bio, status, gihubusername, skills, youtube, facebook, twitter, instagram, linkedin} = req.body;
    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(gihubusername) profileFields.gihubusername = gihubusername;
    if(skills){
        profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    // build social object
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try{
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile){
            // update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true },
            );
            return res.json(profile);
        }
        // Create
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);
    }catch(error){  
        console.error("error in catch", errors.message);
        res.status(500).send("Server failed");

    }
});

// route:           GET api/profile
// description:     get all profiles
// access:          Public
router.get("/", async (req, res)=> {
    try{
        const profiles = await Profile.find().populate("user", ["name", "avatar"]);
        res.json(profiles);
    }catch(error){
        console.error("error in catch", errors.message);
        res.status(500).send("Server failed");
    }
})

// route:           GET api/profile/user/:user_id
// description:     get profile by user_id
// access:          Public
router.get("/user/:user_id", async (req, res)=> {
    try{
        const profile = await Profile.findOne({user: req.params.user_id}).populate("user", ["name", "avatar"]);
        if(!profile) return res.status(400).json({message: "No profile for this user"});
        res.json(profile);
    }catch(error){
        console.error("error in catch", errors.message);
        if(error.kind == "ObjectId"){
            return res.status(400).json({message: "Profile not found"});
        }
        res.status(500).send("Server failed");
    }
})

// route:           DELETE api/profile
// description:     delete profile, user & posts
// access:          Private
router.delete("/", auth, async (req, res)=> {
    try{
        await Profile.findOneAndRemove({user: req.user.id});
        await User.findByIdAndRemove({ _id: req.user.id });

        res.json({message: "User deleted succesfully!"});
    }catch(error){
        console.error("error in catch", errors.message);
        res.status(500).send("Server failed");
    }
})

// route:           PUT api/profile/experience; like UPDATE
// description:     Add profile experience
// access:          Private
router.put("/experience", auth, [
    check("title", "Title is required").not().isEmpty(),
    check("company", "Company is required").not().isEmpty(),
    check("from", "From date is required").not().isEmpty(),
], async (req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const { title, company, location, from, to, current, description } = req.body;
    const newExperience = { title, company, location, from, to, current, description };
    try{
        const profile = await Profile.findOne({ user: req.user.id });// i will get from token
        profile.experience.unshift(newExperience);
        await profile.save();
        res.json(profile);
    }catch(error){
        console.log("Error in catch", error.message);
        res.status(500).send("Server failed");
    }

});

// route:           DELETE  api/profile/experience/:exp_id
// description:     delete experience from profile
// access:          Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        // Get the remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.log("Error in catch", error.message);
        res.status(500).send("Server failed");
    }
})





// router.get("/", (req, res) => {
//     return res.send("Profile route")
// });

module.exports = router;