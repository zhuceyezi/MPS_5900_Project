const {database} = require('../models/models');


class FacialRecService {
    constructor(userServices, awsService, UserFaceMapping) {
        this.userServices = userServices;
        this.awsService = awsService;
        this.UserFaceMapping = UserFaceMapping;
    }

    async addEmployee({employeeId, employeeName, imageBuffer, collectionId}) {
        console.log(this.userServices);
        const trans = await database.transaction();
        try {
            console.debug(employeeId, employeeName, imageBuffer, collectionId);
            const employeeResult = await this.userServices.addEmployeeReturnUserId({employeeId, employeeName},
                                                                                   {transaction: trans});
            const imageId = await this.awsService.simpleIndex(collectionId, imageBuffer);
            if (imageId === undefined || employeeResult === -1) {
                console.log("Error in adding employee");
                await trans.rollback();
                return false;
            }
            await this.UserFaceMapping.create({employeeId: employeeResult, imageId}, {transaction: trans});
            await trans.commit();
            return true;
        } catch (error) {
            console.error(error);
            await trans.rollback();
            return false;
        }
    }

    async recognizeEmployee(collectionId, imageBuffer) {
        try {
            const amazonImageId = await this.awsService.simpleSearchFacesByImage(collectionId, imageBuffer);
            if (amazonImageId === undefined) {
                return null;
            }
            //search the user based on imageId
            const employeeId = await this.UserFaceMapping.findOne({where: {imageId: amazonImageId}});
            if (employeeId === null) {
                return null;
            }
            return await this.userServices.getEmployeeById(employeeId);
        } catch (error) {
            console.error(error);
            return null;
        }

    }
}


module.exports = FacialRecService
