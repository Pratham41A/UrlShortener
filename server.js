import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import cors from "cors";

const server = express();
server.use(cors());
server.use(express.json());

const urlIdMapping = new Map();

try { 
  var swaggerDocument = YAML.load("./swagger.yaml");
  console.log("Swagger file loaded successfully");
} catch (error) {
  console.error("Failed to load swagger.yaml:", error.message);
}


server.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

server.post("/", (req, res) => {
  const id = parseInt(Math.random() * Math.pow(10, 5)).toString();
  const baseUrl = req.protocol + "://" + req.get("host");
  const shortenedUrl = `${baseUrl}/${id}`;

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
    res.json({ error: "Shortened URL Not Found or Expired" });
  }
});

server.listen(3000, () => {
  console.log("Server started at Port 3000");

  setInterval(() => {
    const now = new Date();
    for (const [key, value] of urlIdMapping) {
      
      if (now.getTime() - value.createdAt.getTime() > 24 * 60 * 60 * 1000) {
        urlIdMapping.delete(key);
      }
    }
  }, 60 * 60 * 1000);
});
