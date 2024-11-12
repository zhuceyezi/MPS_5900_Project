require("dotenv").config({path: "../../.env"});
const {Op} = require("sequelize");


class UserService {
    
    /**
     * Creates an instance of UserService.
     * @param models - The DB models.
     */
    constructor(models) {
        this.models = models;
    }
    
    /**
     * Adds an employee to the system.
     * @param {Object} params - The parameters.
     * @param {string} params.employeeId - The employee ID.
     * @param {string} params.employeeName - The employee name.
     * @param {Object} [options={}] - Additional options.
     * @returns {Promise<{result: boolean, employee: any}|{result: boolean}>} - True
     * if the employee was added
     * successfully, false
     * otherwise.
     */
    async addEmployee({employeeId, employeeName}, options = {}) {
        try {
            console.debug(
                `Adding Employee: ${JSON.stringify(
                    /** @type Employee */
                    {
                        employeeId,
                        employeeName
                    },
                    null,
                    2
                )}`
            );
            const values = {
                employeeName: employeeName,
                lastLogin: new Date(),
                employeeId: employeeId
            };
            const getModel = options.returning !== undefined;
            const employee = await this.models.Employee.create(values, options);
            if (employee === null || typeof employee !== 'object') {
                return {result: false, error: "error when creating employee"}
            }
            return getModel ? {result: true, model: employee} : {result: true};
        } catch (error) {
            console.error(error);
            return {result: false, error: error};
        }
    }
    
    /**
     * Gets an employee by ID.
     * @param {string} employeeKey - The employee Key.
     * @returns {Promise<Object|null>} - The employee object if found, null otherwise.
     */
    async getEmployeeByKey(employeeKey) {
        return await this.models.Employee.findOne({where: {key: employeeKey}});
    }
    
    /**
     * Deletes an employee by name.
     * @param {string} name - The employee name.
     * @returns {Promise<boolean>} - True if the employee was deleted successfully, false otherwise.
     */
    async deleteEmployeeByName(name) {
        try {
            console.debug(`Deleting Employee: ${name}`);
            const deleteNumber = await this.models.Employee.destroy({
                                                                        where: {
                                                                            employeeName: name
                                                                        }
                                                                    });
            return deleteNumber > 0;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    /**
     * Updates an employee.
     * @param {Object} params - The parameters.
     * @param {string} params.employeeId - The employee ID.
     * @param {Date} params.lastLogin - The last login date.
     * @param {string} params.employeeName - The employee name.
     * @returns {Promise<boolean>} - True if the employee was updated successfully, false otherwise.
     */
    async updateEmployee({
                             employeeId,
                             lastLogin,
                             employeeName
                         } = {}) {
        try {
            console.debug(
                `Updating Employee: ${JSON.stringify(
                    {
                        employeeId,
                        lastLogin,
                        employeeName
                    },
                    null,
                    2
                )}`
            );
            if (employeeId === undefined) {
                throw new Error(`employeeId should be defined`);
            }
            const resultArray = await this.models.Employee.update(
                {
                    lastLogin: lastLogin,
                    employeeName: employeeName,
                    employeeId: employeeId
                },
                {
                    where: {
                        employeeId: employeeId
                    }
                }
            );
            //check if the update was successful
            return resultArray[0] > 0;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    
    // TODO: Retreive employees by ID and name
    
    /**
     * Adds feedback for an employee.
     * @param {Object} params - The parameters as a json.
     * @param {string} params.employeeId - The employee ID.
     * @param {string} params.employeeName - The employee name.
     * @param {string} params.feedback - The feedback content.
     * @param {Object} options - Additional options as json for model.create() method for sequelize.
     * @returns {Promise<{result: boolean, error}>} - True if the feedback was added successfully, false otherwise.
     */
    async addFeedback({employeeId, employeeName, feedback}, options = {}) {
        try {
            const employee = await this.models.Employee.findOne({
                                                                    where: {
                                                                        [Op.and]: [
                                                                            {employeeId: employeeId},
                                                                            {employeeName: employeeName}
                                                                        ]
                                                                    }
                                                                });
            if (employee === null) {
                return {result: false, error: "Employee not found"};
            }
            await this.models.Feedback.create({
                                                  content: feedback,
                                                  employeeKey: employee.key
                                              }, options);
            return {result: true};
        } catch (e) {
            console.error(e);
            return {result: false, error: e};
        }
    }
    
    async #getEmployee({employeeId, employeeName}) {
        try {
            return await this.models.Employee.findOne({
                                                          where: {
                                                              [Op.and]: [
                                                                  {employeeId: employeeId},
                                                                  {employeeName: employeeName}
                                                              ]
                                                          }
                                                      });
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    
    async getFaceId({employeeId, employeeName}) {
        try {
            const employee = await this.#getEmployee({employeeId, employeeName});
            if (employee === null) {
                return null;
            }
            const mappingRecord = await this.models.UserFaceMapping.findOne({
                                                                                where: {
                                                                                    employeeKey: employee.key
                                                                                }
                                                                            })
            return mappingRecord.faceId;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    
    async #getImageId(employeeId, employeeName) {
        try {
            const employee = await this.#getEmployee(employeeId, employeeName);
            if (employee === null) {
                return null;
            }
            const mappingRecord = await this.models.UserFaceMapping.findOne({
                                                                                where: {
                                                                                    employeeKey: employee.key
                                                                                }
                                                                            })
            return mappingRecord.imageId;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    
    async verifyEmployee({employeeId, employeeName}) {
        try {
            const employee = await this.models.Employee.findOne({
                                                                    where: {
                                                                        [Op.and]: [
                                                                            {employeeId: employeeId},
                                                                            {employeeName: employeeName}
                                                                        ]
                                                                    }
                                                                });
            if (employee !== null) {
                return {result: true}
            }
            return {result: false, error: "Employee not found"};
        } catch (e) {
            console.error(e);
            return {result: false, error: e};
        }
    }
    
    async deleteEmployee({employeeId, employeeName}) {
        const transaction = await this.models.Employee.sequelize.transaction();
        try {
            const employee = await this.models.Employee.findOne({
                                                                    where: {
                                                                        [Op.and]: [
                                                                            {employeeId: employeeId},
                                                                            {employeeName: employeeName}
                                                                        ]
                                                                    }
                                                                });
            if (employee === null) {
                throw new Error("Employee not found");
            }
            await this.models.Employee.destroy({
                                                   where: {
                                                       [Op.and]: [
                                                           {employeeId: employeeId},
                                                           {employeeName: employeeName}
                                                       ]
                                                   },
                                                   transaction
                                               })
            await transaction.commit();
            return {result: true};
        } catch (e) {
            await transaction.rollback();
            console.error(e);
            return {result: false, error: e};
        }
    }
}


module.exports = UserService;
