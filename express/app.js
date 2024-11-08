require("dotenv").config({path: "/Users/serena.z/Documents/GitHub/MPS_5900_Project/.env"});
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./apiServices");
const {database} = require("./models/models");
const userRouter = require("./routers/userRouter");
const UserServices = require("./apiServices/UserService");
const UserController = require("./controllers/UserController");
const models = require("./models/models");
const upload = require("./config/multerSetUp");
const FacialRecService = require("./apiServices/FacialRecService");
const FacialRecController = require("./controllers/FacialRecController");
const AwsService = require("./apiServices/AwsService");
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
            .sync({alter: true})
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
const awsService = new AwsService();
const userServices = new UserServices(models);
const facialRecService = new FacialRecService(userServices, awsService, models);
const userController = new UserController(userServices, facialRecService);
const facialRecController = new FacialRecController(facialRecService, process.env.COLLECTION_ID);
app.use("/", indexRouter);
app.use("/employees", userRouter(userController, userServices, awsService, facialRecService, upload));

const collectionId = process.env.COLLECTION_ID;
app.use("/facial",
        facialRecRouter(userServices, awsService, facialRecService,
                        facialRecController,
                        upload));


module.exports = app;
