class UserController {
    constructor(userService, facialRecService) {
        this.userService = userService;
        this.facialRecService = facialRecService;
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
            const addResult = await this.userService.addEmployee({employeeId, employeeName});
            if (addResult) return res.status(201).json({message: "Employee added"});
            return res.status(500).json({message: "Internal server error"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error: " + e});
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
            const updateResult = await this.userService.updateEmployee({employeeId, lastLogin, employeeName});
            if (updateResult) return res.status(200).json({message: "Employee updated"});
            return res.status(404).json({message: "Employee not found"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error: " + e});
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
            const addResult = await this.userService.addFeedback({employeeId, employeeName, feedback});
            if (!addResult.result) {
                return res.status(500).json({message: addResult.error});
            }
            return res.status(201).json({message: "Feedback added"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Internal server error: " + e});
        }
    }
    
    async verifyEmployee(req, res) {
        try {
            const employeeId = req.query.employeeId;
            const employeeName = req.query.employeeName;
            if (employeeId === undefined || employeeName === undefined) {
                return res.status(400).json({message: "employeeId or employeeName not found in request query"});
            }
            const verifyResult = await this.userService.verifyEmployee({employeeId, employeeName});
            if (verifyResult.result) {
                return res.status(200).json({message: "Employee verified"});
            }
            return res.status(404).json({message: verifyResult.error});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Internal server error: " + e});
        }
    }
    
    async deleteEmployee(req, res) {
        try {
            const body = req.body;
            const employeeId = body.employeeId;
            const employeeName = body.employeeName;
            if (employeeId === undefined || employeeName === undefined) {
                return res.status(400).json({message: "employeeId or employeeName not found in request query"});
            }
            const deleteFaceResult = await this.facialRecService.deleteFace({employeeId, employeeName});
            if (!deleteFaceResult.result) {
                return res.status(500).json({message: deleteFaceResult.error});
            }
            const deleteResult = await this.userService.deleteEmployee({employeeId, employeeName});
            if (!deleteResult.result) {
                return res.status(500).json({message: deleteResult.error});
            }
            return res.status(200).json({message: "Employee deleted"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Internal server error: " + e});
        }
    }
}


module.exports = UserController