const { sequelize } = require("./models");

require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// connect and syc to the database
sequelize
  .authenticate()
  .then(() => {
    sequelize
      .sync()
      .then(() => {
        console.log("successful connect to database and sync the schemas");
      })
      .catch((err) => {
        console.log("error during the sync the model process");
        console.log(err);
      });
  })
  .catch((err) => {
    console.log("error when connecting to database");
    console.log(err);
    console.log(sequelize.config.host);
    console.log(sequelize.config.port);
    console.log(sequelize.config.database);
    console.log(sequelize.config.username);
  });

module.exports = app;
