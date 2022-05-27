import express from "express";
import { Config } from "./utils/config";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/hello", (request, response) => {
    response.status(200).json({message: "Hello World!"})
})

app.listen(Config.port, () => console.log(`Server listening on port ${Config.port}`));

export default app;