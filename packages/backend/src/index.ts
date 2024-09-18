import "dotenv/config";
import express from "express";

const port = Number(process.env.PORT as string);

const app = express();
app.listen(port, () => {
  console.info(`Server started on port ${port}`);
});
