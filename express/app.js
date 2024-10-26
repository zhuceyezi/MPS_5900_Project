require("dotenv").config({path: "/Users/serena.z/Documents/GitHub/MPS_5900_Project/.env"});
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./apiServices");
const {database} = require("./models/models");
const userRouter = require("./routers/userRouter");
const userServices = require("./apiServices/UserService");
const userController = require("./controllers/UserController");
const employeeModel = require("./models/Employee");
const upLoad = require("./config/multerSetUp");
const facialRecService = require("./apiServices/FacialRecService");
const facialRecController = require("./controllers/FacialRecController");
const UserFaceMapping = require("./models/UserFaceMapping");
const awsService = require("./apiServices/AwsService");
const facialRecRouter = require("./routers/FacialRecRouter");
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());// Allow all origins, you can customize it later

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

const collectionId = process.env.COLLECTION_ID;
app.use("/facial",
        facialRecRouter(userServices, employeeModel, awsService, UserFaceMapping, facialRecService, facialRecController,
                        upLoad,
                        collectionId));


// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;
