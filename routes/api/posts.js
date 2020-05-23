const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
// Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// route        POST api/posts
// description  create post
// access       Private
router.post("/", auth, [
    check("text", "Text is required").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findById(req.user.id).select("-password");
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});

// route        GET api/posts
// description  get all posts
// access       Private
router.get("/", auth, async (req, res) => { // auth that is what makes route private
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});

// route        GET api/posts/:id
// description  get post by id
// access       Private
router.get("/:id", auth, async (req, res) => { // auth that is what makes route private
    try {
        const post = await Post.findById(req.params.id);
        // if not valid id is passed
        if(!post){
            return res.status(404).json({ message: "Post not found!" });
        }
        res.json(post);
    } catch (error) {
        // if not valid id is passed
        if(error.kind === "ObjectId"){
            return res.status(404).json({ message: "Post not found!" });
        }
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});

// route        Delete api/posts/:id
// description  delete a post
// access       Private
router.delete("/:id", auth, async (req, res) => { // auth that is what makes route private
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ message: "Post not found!" });
        }        
        // check if deleting user is the user that owns the post
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ message: "User not authorized"});
        }
        await post.remove();
        res.json({ message: "Post successfully removed!"});
    } catch (error) {
        if(error.kind === "ObjectId"){
            return res.status(404).json({ message: "Post not found!" });
        }        
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});

// route        PUT api/posts/like:id
// description  like a post
// access       Private
router.put("/like/:id", auth, async (req, res) => { // auth that is what makes route private
    try {
        const post = await Post.findById(req.params.id);
        // Check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ message: "Post already liked!"})
        }
        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});

// route        PUT api/posts/unlike:id
// description  Unlike a post
// access       Private
router.put("/unlike/:id", auth, async (req, res) => { // auth that is what makes route private
    try {
        const post = await Post.findById(req.params.id);
        // Check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ message: "Post has not been liked"})
        }
        // get the remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);


        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});

// route        POST api/posts/comment/:id
// description  comment on a post
// access       Private
router.post("/comment/:id", auth, [
    check("text", "Text is required").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findById(req.user.id).select("-password");
        const post = await Post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };
        post.comments.unshift(newComment);

        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});

// route        DELETE api/posts/comment/:post_id/:comment_id
// description  delete comment
// access       Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        // make sure comment exists
        if(!comment){
            return res.status(404).json({ message: "Comment does not exist"});
        }
        // check the user
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ message: "User not authorized"});
        }
        // Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);

        await post.save();
        res.json(post.comments);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server failed");
    }
});


// route        GET api/posts
// description  test route
// access       Public

// router.get("/", (req, res) => {
//     return res.send("Post route")
// });

module.exports = router;