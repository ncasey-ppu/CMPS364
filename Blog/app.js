require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

//Connect to MongoDB
mongoose
 .connect(process.env.MONGO_URI)
 .then(() => console.log("Connected to MongoDB"))
 .catch((err) => console.error(err));

//Routes
app.get("/", async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render("index", { posts });
});

app.get("/posts/new", (req, res) => {
    res.render("newPost");
});

app.post("/posts", async (req, res) => {
    const { title, content } = req.body;
    await Post.create({ title, content });
    res.redirect("/");
});

app.get("/posts/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
      const comments = await Comment.find({ postId: post._id }).sort({ createdAt: 1 });
    res.render("post", { post, comments });
});

app.get("/search", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect("/");
    const results = await Post.find(
        { $text: { $search: query } },
        { score: {$meta: "textScore" } }
    ).sort({ score: {$meta: "textScore" } });
    res.render("searchResults", { results, query });
});

app.post("/posts/:id/comments", async (req, res) => {
  const { author, comment } = req.body;
  const postId = req.params.id;

  if (!author || !comment || !postId) {
    return res.status(400).send("Author, comment, and postId are required.");
  }

  const newComment = await Comment.create({
    author,
    comment,
    postId
  });

  if (io) {
    io.to(postId).emit("newComment", newComment);
  }

  res.redirect(`/posts/${postId}`);
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinPostRoom", (postId) => {
    socket.join(postId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  const comments = await Comment.find({ postId: post._id }).sort({ createdAt: 1 });
  res.render("post", { post, comments });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});