class UserController {
    constructor(userServices, facialRecService) {
        this.userServices = userServices;
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
            const addResult = await this.userServices.addEmployee({employeeId, employeeName});
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
            const updateResult = await this.userServices.updateEmployee({employeeId, lastLogin, employeeName});
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
            const addResult = await this.userServices.addFeedback({employeeId, employeeName, feedback});
            if (!addResult) {
                throw new Error("addFeedback failed");
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
            const verifyResult = await this.userServices.verifyEmployee({employeeId, employeeName});
            if (verifyResult) return res.status(200).json({message: "Employee verified"});
            return res.status(404).json({message: "Employee not found"});
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
            const deleteResult = await this.userServices.deleteEmployee({employeeId, employeeName});
            if (!deleteResult) {
                return res.status(500).json({message: "error in deleting employee"});
            }
            const deleteFaceResult = await this.facialRecService.deleteFace(employeeId);
            if (!deleteFaceResult) {
                return res.status(500).json({message: "error in deleting face from collection"});
            }
            return res.status(200).json({message: "Employee deleted"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Internal server error: " + e});
        }
    }
}


module.exports = UserController