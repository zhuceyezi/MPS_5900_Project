const express = require('express');
const router = express.Router();

module.exports = (controller, service, model) => {
    const userService = new service(model);
    const userController = new controller(userService);

    //POST /employees
    router.post('/', (req, res) => userController.addEmployee(req, res));

    //DELETE /employees/:name
    router.delete('/:name', (req, res) => userController.deleteEmployeeByName(req, res));

    //PUT /employees
    router.put('/', (req, res) => userController.updateEmployee(req, res));

    return router;
};