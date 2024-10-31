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
            if (employeeId === undefined || employeeName === undefined) {
                return res.status(400)
                          .json(
                              {message: "employeeId or employeeName not found in request body"});
            }
            const addResult = await this.userServices.addEmployee({employeeId, employeeName});
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
            const lastLogin = body.lastLogin;
            if (employeeId === undefined || employeeName === undefined || lastLogin === undefined) {
                return res.status(400).json({message: "Bad request"});
            }
            const updateResult = await this.userServices.updateEmployee({employeeId, lastLogin, employeeName});
            if (updateResult) return res.status(200).json({message: "Employee updated"});
            return res.status(404).json({message: "Employee not found"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }
    
    async addFeedback(req, res) {
        try {
            const body = req.body;
            const employeeId = body.employeeId;
            const employeeName = body.employeeName;
            const feedback = body.content;
            if (employeeId === undefined || employeeName === undefined) {
                return res.status(400).json({message: "employeeId or employeeName not found in request body"});
            }
            const addResult = await this.userServices.addFeedback({employeeId, employeeName, feedback});
            if (!addResult) {
                throw new Error("addFeedback failed");
            }
            return res.status(201).json({message: "Feedback added"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Internal server error"});
        }
    }
}


module.exports = UserController