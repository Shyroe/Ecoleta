import express from "express";

const app = express();

app.get("/users", (req, res) => {
  console.log("list users");
  res.json({
    name: "leonardo lopes",
    age: 35,
  });
});

app.listen(3333);
