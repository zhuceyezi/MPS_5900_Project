const {sequelize} = require('../models');


class FacialRecService {
    constructor(userServices, awsService, UserFaceMapping) {
        this.userServices = userServices;
        this.awsService = awsService;
        this.UserFaceMapping = UserFaceMapping;
    }

    async addEmployee({employeeId, employeeName, imageBuffer, collectionId}) {
        const trans = await sequelize.transaction();
        try {
            const employeeResult = await this.userServices.addEmployee({employeeId, employeeName});
            const imageId = await this.awsService.simpleIndex(collectionId, imageBuffer);
            if (imageId === undefined || !employeeResult) {
                console.log("Error in adding employee");
                trans.rollback();
                return false;
            }
            await this.UserFaceMapping.create({employeeId, imageId});
            return true;
        } catch (error) {
            console.error(error);
            trans.rollback();
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
