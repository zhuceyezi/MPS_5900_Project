class FacialRecController {
    constructor(facialRecService, collectionId) {
        this.facialRecService = facialRecService;
        this.collectionId = collectionId;
    }

    async addEmployee(req, res) {
        try {
            const body = req.body;
            const employeeId = body.employeeId;
            const employeeName = body.employeeName;
            const collectionId = this.collectionId;
            const imageBuffer = req.file.buffer;
            console.log(employeeId, employeeName, collectionId, imageBuffer);
            if (employeeId === undefined || employeeName === undefined || collectionId === undefined || imageBuffer === undefined) {
                return res.status(400).json({message: "Bad request"});
            }
            const addResult = await this.facialRecService.addEmployee(
                {employeeId, employeeName, imageBuffer, collectionId});
            if (addResult === false) {
                return res.status(500).json({message: "Internal server error"});
            }
            return res.status(201).json(addResult);
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }

    async validateEmployee(req, res) {
        try {
            const collectionId = this.collectionId;
            const imageBuffer = req.file.buffer;
            if (collectionId === undefined || imageBuffer === undefined) {
                return res.status(400).json({message: "Bad request"});
            }
            const employee = await this.facialRecService.recognizeEmployee(collectionId, imageBuffer);
            if (employee === null) return res.status(404).json({message: "Employee not found"});
            return res.status(200).json(employee);
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }

    async deleteAllFaces(req, res) {
        try {
            const collectionId = this.collectionId;
            if (collectionId === undefined) {
                return res.status(400).json({message: "Bad request"});
            }
            const deleteResult = await this.facialRecService.deleteAllFaces(collectionId);
            console.log(deleteResult);
            if (deleteResult === false) {
                return res.status(500).json({message: "Internal server error"});
            }
            return res.status(200).json({message: "All faces deleted"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }

}


module.exports = FacialRecController