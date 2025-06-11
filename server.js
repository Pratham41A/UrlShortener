import express from "express";

const server = express();
const urlIdMapping = new Map();
server.use(express.json());

//Use req.url or req.originalUrl

server.post("/", (req, res) => {
  const id = parseInt(Math.random() * Math.pow(10, 5)).toString();
  const shortenedUrl =
    req.protocol + "://" + req.get("host") + req.originalUrl + id;

  urlIdMapping.set(id, { redirectionUrl: req.body.url, createdAt: new Date() });
  //res.statusCode = 201
  res.status(201);
  res.json({ shortenedUrl });
});

server.get("/:id", (req, res) => {
  if (urlIdMapping.has(req.params.id)) {
    res.redirect(urlIdMapping.get(req.params.id).redirectionUrl);
  } else {
    res.status(404);
    res.json({ error: "Shortened URL Expired" });
  }
});

server.listen(3000, () => {
  console.log("Server started at Port 3000");

  setInterval(() => {
    const now = new Date();
    for (const [key, value] of urlIdMapping) {
      console.log(value.createdAt.getTime());
      console.log(now.getTime());
      if (now.getTime() - value.createdAt.getTime() > 24 * 60 * 60 * 1000) {
        urlIdMapping.delete(key);
      }
    }
  }, 60 * 60 * 1000);
});
