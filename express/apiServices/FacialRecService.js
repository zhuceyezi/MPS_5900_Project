const models = require('../models/models');
const database = models.database;


/**
 * FacialRecService class to handle facial recognition operations.
 */
class FacialRecService {
    /**
     * Creates an instance of FacialRecService.
     * @param userService
     * @param {Object} awsService - The AWS service instance.
     * @param models - The DB models.
     */
    constructor(userService, awsService, models) {
        this.userService = userService;
        this.awsService = awsService;
        this.models = models
    }
    
    /**
     * Adds an employee to the system.
     * @param {Object} params - The parameters.
     * @param {string} params.employeeId - The employee ID.
     * @param {string} params.employeeName - The employee name.
     * @param {Buffer} params.imageBuffer - The image buffer.
     * @returns {Promise<{result: boolean, error}>} - True if the employee was added successfully, false otherwise.
     */
    async addEmployee({employeeId, employeeName, imageBuffer}) {
        const collectionId = process.env.COLLECTION_ID;
        const trans = await database.transaction();
        let faceId = undefined;
        let imageId = undefined;
        try {
            console.debug(employeeId, employeeName, imageBuffer, collectionId);
            const employeeResponse = await this.userService.addEmployee({employeeId, employeeName},
                                                                        {
                                                                            transaction: trans,
                                                                            returning: true
                                                                        });
            const employee = employeeResponse.model;
            console.log(employee);
            if (!employeeResponse.result) {
                return {result: false, error: employee.error};
            }
            [faceId, imageId] = await this.awsService.indexFaces(imageBuffer, employeeName);
            if (faceId === undefined || imageId === undefined) {
                console.log("Error in adding employee");
                await trans.rollback();
                return {result: false, error: "faceId or imageId is undefined"};
            }
            console.log(imageId, faceId);
            await this.models.UserFaceMapping.create({employeeKey: employee.key, imageId: imageId, faceId: faceId},
                                                     {transaction: trans});
            await trans.commit();
            return {result: true};
        } catch (error) {
            console.error(error);
            await trans.rollback();
            await this.awsService.deleteFaces([faceId])
            return {result: false, error: error};
        }
    }
    
    /**
     * Deletes all faces in a collection.
     * @returns {Promise<{result: boolean, error}>} - True if all faces were deleted successfully, false otherwise.
     */
    async deleteAllFaces() {
        try {
            await this.awsService.deleteAllFaces(process.env.COLLECTION_ID);
            return {result: true};
        } catch (error) {
            return {result: false, error: error};
        }
    }
    
    /**
     * Deletes a face associated with an employee
     * @param employeeId
     * @param employeeName
     * @returns {Promise<{result: boolean, error}|{result: boolean}|{result: boolean, error: string}>}
     */
    async deleteFace({employeeId, employeeName}) {
        try {
            const collectionId = process.env.COLLECTION_ID;
            const faceId = await this.userService.getFaceId({employeeId, employeeName})
            console.log(faceId);
            if (faceId === null || faceId.length === 0) {
                return {result: false, error: "No face associated with that employee was found."};
            }
            const deleteResult = await this.awsService.deleteFaces([faceId]);
            if (!deleteResult.result) {
                console.error(deleteResult.error);
                return {result: false, error: deleteResult.error};
            }
            return {result: true};
        } catch (e) {
            console.log(e);
            return {result: false, error: e};
        }
    }
    
    /**
     * Recognizes an employee based on an image.
     * @param {Buffer} imageBuffer - The image buffer.
     * @returns {Promise<Object|null>} - The employee object if found, null otherwise.
     */
    async recognizeEmployee(imageBuffer) {
        try {
            const amazonImageId = await this.awsService.searchFacesByImage(imageBuffer);
            console.log(amazonImageId);
            if (amazonImageId === undefined) {
                return null;
            }
            // Search the user based on imageId
            const mapping = await this.models.UserFaceMapping.findOne({where: {imageId: amazonImageId}, raw: true});
            console.log(mapping);
            if (mapping === null) {
                return null;
            }
            return await this.userService.getEmployeeByKey(mapping.employeeKey);
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}


module.exports = FacialRecService;