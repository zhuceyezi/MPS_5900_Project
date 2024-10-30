const models = require('../models/models');
const database = models.database;


/**
 * FacialRecService class to handle facial recognition operations.
 */
class FacialRecService {
    /**
     * Creates an instance of FacialRecService.
     * @param {Object} userServices - The user services instance.
     * @param {Object} awsService - The AWS service instance.
     * @param models - The DB models.
     */
    constructor(userServices, awsService, models) {
        this.userServices = userServices;
        this.awsService = awsService;
        this.UserFaceMapping = models.UserFaceMapping;
    }
    
    /**
     * Adds an employee to the system.
     * @param {Object} params - The parameters.
     * @param {string} params.employeeId - The employee ID.
     * @param {string} params.employeeName - The employee name.
     * @param {Buffer} params.imageBuffer - The image buffer.
     * @param {string} params.collectionId - The collection ID.
     * @returns {Promise<boolean>} - True if the employee was added successfully, false otherwise.
     */
    async addEmployee({employeeId, employeeName, imageBuffer, collectionId}) {
        console.log(this.userServices);
        const trans = await database.transaction();
        try {
            console.debug(employeeId, employeeName, imageBuffer, collectionId);
            const employeeResult = await this.userServices.addEmployeeReturnUserId({employeeId, employeeName},
                                                                                   {transaction: trans});
            const [faceId, imageId] = await this.awsService.indexFaces(collectionId, imageBuffer);
            if (faceId === undefined || imageId === undefined || employeeResult === -1) {
                console.log("Error in adding employee");
                await trans.rollback();
                return false;
            }
            console.log(imageId, faceId);
            await this.UserFaceMapping.create({employeeKey: employeeResult, imageId: imageId, faceId: faceId},
                                              {transaction: trans});
            await trans.commit();
            return true;
        } catch (error) {
            console.error(error);
            await trans.rollback();
            return false;
        }
    }
    
    /**
     * Deletes all faces in a collection.
     * @param {string} collectionId - The collection ID.
     * @returns {Promise<boolean>} - True if all faces were deleted successfully, false otherwise.
     */
    async deleteAllFaces(collectionId) {
        try {
            await this.awsService.deleteAllFaces(collectionId);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Recognizes an employee based on an image.
     * @param {string} collectionId - The collection ID.
     * @param {Buffer} imageBuffer - The image buffer.
     * @returns {Promise<Object|null>} - The employee object if found, null otherwise.
     */
    async recognizeEmployee(collectionId, imageBuffer) {
        try {
            const amazonImageId = await this.awsService.searchFacesByImage(collectionId, imageBuffer);
            console.log(amazonImageId);
            if (amazonImageId === undefined) {
                return null;
            }
            // Search the user based on imageId
            const mapping = await this.UserFaceMapping.findOne({where: {imageId: amazonImageId}, raw: true});
            console.log(mapping);
            if (mapping === null) {
                return null;
            }
            return await this.userServices.getEmployeeByKey(mapping.employeeKey);
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}


module.exports = FacialRecService;