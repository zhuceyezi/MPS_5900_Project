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
const models = require("./models/models");
const upload = require("./config/multerSetUp");
const facialRecService = require("./apiServices/FacialRecService");
const facialRecController = require("./controllers/FacialRecController");
const awsService = require("./apiServices/AwsService");
const facialRecRouter = require("./routers/FacialRecRouter");
const cors = require('cors');
const app = express();
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
app.use("/employees", userRouter(userController, userServices, upload, models));

const collectionId = process.env.COLLECTION_ID;
app.use("/facial",
        facialRecRouter(userServices, awsService, models, facialRecService,
                        facialRecController,
                        upload,
                        collectionId));


module.exports = app;
