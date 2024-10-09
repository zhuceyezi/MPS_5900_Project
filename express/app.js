require("dotenv").config({path: "../.env"});
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./apiServices");
const usersRouter = require("./apiServices/users");
const {database} = require("./models/models");
const userRouter = require("./routers/userRouter");
const userServices = require("./apiServices/UserService");
const userController = require("./controllers/UserController");
const employeeModel = require("./models/Employee");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

database
    .authenticate()
    .then(() => {
        database
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
    });


app.use("/", indexRouter);
app.use("/employees", userRouter(userController, userServices, employeeModel));

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`server is running on port ${PORT}`);
// });
module.exports = app;
