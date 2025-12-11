const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

postSchema.index({ title: "text", content: "text" });

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);