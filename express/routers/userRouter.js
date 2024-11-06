const express = require('express');
const router = express.Router();

module.exports = (Controller, UserService, awsService, FacialRecService, upload, models) => {
    const userService = new UserService(models);
    const facialRecService = new FacialRecService(userService, awsService, models);
    const userController = new Controller(userService, facialRecService);
    
    //POST /employees
    router.post('/', (req, res) => userController.addEmployee(req, res));
    
    //DELETE /employees/delete
    router.delete('/delete', upload.none(), (req, res) => userController.deleteEmployee(req, res));
    
    //PUT /employees
    router.put('/', (req, res) => userController.updateEmployee(req, res));
    
    router.get('/verifyEmployee', (req, res) => userController.verifyEmployee(req, res));
    
    router.post('/addFeedback', upload.none(), (req, res) => userController.addFeedback(req, res));
    return router;
};