const express = require('express');
const router = express.Router();

module.exports = (controller, service, upload, models) => {
    const userService = new service(models);
    const userController = new controller(userService);
    
    //POST /employees
    router.post('/', (req, res) => userController.addEmployee(req, res));
    
    //DELETE /employees/:name
    router.delete('/:name', (req, res) => userController.deleteEmployeeByName(req, res));
    
    //PUT /employees
    router.put('/', (req, res) => userController.updateEmployee(req, res));
    
    router.get('/verifyEmployee', (req, res) => userController.verifyEmployee(req, res));
    
    router.post('/addFeedback', upload.none(), (req, res) => userController.addFeedback(req, res));
    return router;
};