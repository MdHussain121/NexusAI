const express = require("express");
const path = require("path");
const app = express();

const port = process.env.PORT || 5000;

// Serve the landing page assets from /public
app.use(express.static(path.join(__dirname, "public")));

// Serve the provided SVG pack (asset compliance) under /SVG
app.use("/SVG", express.static(path.join(__dirname, "SVG")));

// JSON health endpoint (kept for monitoring / tests)
app.get("/api/health", (req, res) => {
  return res.status(200).send({
    message: "Hello World!",
  });
});

// Serve the landing page at the root
app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log("Listening on " + port);
});

module.exports = app;
