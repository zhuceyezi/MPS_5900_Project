const { sequelize, Employee } = require("./models");

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

const addSampleEmployee = async () => {
  try {
    await Employee.create({
      imageId: "123",
      name: "Runyu Yue",
      lastLogin: new Date(),
      EmployeeId: "1234",
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteEmployeeByName = async (name) => {
  try {
    await Employee.destroy({
      where: {
        name: name,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

// connect and syc to the database
sequelize
  .authenticate()
  .then(() => {
    sequelize
      .sync()
      .then(() => {
        console.log("successful connect to database and sync the schemas");
        deleteEmployeeByName("John Doe");
      })
      .catch((err) => {
        console.log("error during the sync the model process");
        console.log(err);
      });
  })
  .catch((err) => {
    console.log("error when connecting to database");
    console.log(err);
  });

module.exports = app;
