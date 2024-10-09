const http = require('node:http');


class UserController {
    constructor(userServices) {
        this.userServices = userServices;
    }
    
    //field data should be in the request body as json
    async addEmployee(req, res) {
        try {
            const body = req.body;
            const employeeId = body.employeeId;
            const employeeName = body.employeeName;
            const imageId = body.imageId;
            if (employeeId === undefined || employeeName === undefined || imageId === undefined) {
                return res.status(400)
                          .json(
                              {message: "Bad request"});
            }
            const addResult = await this.userServices.addEmployee({employeeId, employeeName, imageId});
            if (addResult) return res.status(201).json({message: "Employee added"});
            return res.status(500).json({message: "Internal server error"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }
    
    //the name should be delivered as request parameter
    async deleteEmployeeByName(req, res) {
        try {
            const name = req.params.name;
            if (name === undefined) return res.status(400).json({message: "Bad request"});
            const deleteResult = await this.userServices.deleteEmployeeByName(name);
            if (deleteResult) return res.status(200).json({message: "Employee deleted"});
            return res.status(404).json({message: "Employee not found"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }
    
    async updateEmployee(req, res) {
        try {
            const body = req.body;
            const employeeId = body.employeeId;
            const employeeName = body.employeeName;
            const imageId = body.imageId;
            const lastLogin = body.lastLogin;
            if (employeeId === undefined || employeeName === undefined || imageId === undefined || lastLogin === undefined) {
                return res.status(400).json({message: "Bad request"});
            }
            const updateResult = await this.userServices.updateEmployee({employeeId, lastLogin, employeeName, imageId});
            if (updateResult) return res.status(200).json({message: "Employee updated"});
            return res.status(404).json({message: "Employee not found"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }
}


module.exports = UserController