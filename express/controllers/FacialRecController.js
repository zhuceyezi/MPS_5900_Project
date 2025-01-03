class FacialRecController {
    constructor(facialRecService) {
        this.facialRecService = facialRecService;
    }

    async addEmployee(req, res) {
        try {
            const body = req.body;
            const employeeId = body.employeeId;
            const employeeName = body.employeeName;
            const imageBuffer = req.file.buffer;
            console.log(employeeId, employeeName, imageBuffer);
            if (employeeId === undefined || employeeName === undefined || imageBuffer === undefined) {
                return res.status(400).json({message: "Bad request"});
            }
            const addResult = await this.facialRecService.addEmployee(
                {employeeId, employeeName, imageBuffer});
            if (!addResult.result) {
                return res.status(500)
                    .json({message: "Internal server error: addEmployee failed: " + addResult.error.toString()});
            }
            return res.status(201).json("Employee added");
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error: " + err.toString()});
        }
    }

    async validateEmployee(req, res) {
        try {
            const collectionId = process.env.COLLECTION_ID;
            if (req.file === undefined || collectionId === undefined) {
                return res.status(400).json({message: "Bad request, check if all required fields exist."});
            }
            const imageBuffer = req.file.buffer;
            const employee = await this.facialRecService.recognizeEmployee(imageBuffer);
            if (employee === null) return res.status(200).json({message: "Employee not found"});
            return res.status(200).json({message: "Employee found", model: employee});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error" + err.toString()});
        }
    }

    async deleteAllFaces(req, res) {
        try {
            const deleteResult = await this.facialRecService.deleteAllFaces();
            console.log(deleteResult);
            if (deleteResult === false) {
                return res.status(500).json({message: "Internal server error"});
            }
            return res.status(200).json({message: "All faces deleted"});
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Internal server error" + err.toString()});
        }
    }

}


module.exports = FacialRecController