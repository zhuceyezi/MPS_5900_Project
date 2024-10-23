const express = require('express');
const router = express.Router();

module.exports = (UserService, employeeModel, AwsService, UserFaceMapping, FacialRecService, FacialRecController,
                  upLoad,
                  collectionId) => {
    const userServiceInstance = new UserService(employeeModel);
    const awsServiceInstance = new AwsService();
    const facialRecService = new FacialRecService(userServiceInstance, awsServiceInstance, UserFaceMapping);
    const facialRecController = new FacialRecController(facialRecService, collectionId);
    //POST /employees
    router.post('/', (req, res, next) => {
        upLoad.single('image')(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err); // Log the Multer error
                return res.status(500).json({error: err.message});
            }
            console.log('hit'); // This will print if there’s no error
            facialRecController.addEmployee(req, res);
        });
    });


    //POST /employees/validate
    router.post('/validate', upLoad.single('image'), (req, res) => facialRecController.validateEmployee(req, res));
    router.delete('/all', (req, res) => facialRecController.deleteAllFaces(req, res));

    return router;
}