require("dotenv").config({path: "../../.env"});
const {Op} = require("sequelize");


class UserService {
    
    /**
     * Creates an instance of UserService.
     * @param models - The DB models.
     */
    constructor(models) {
        this.Employee = models.Employee;
        this.Feedback = models.Feedback;
    }
    
    /**
     * Adds an employee to the system.
     * @param {Object} params - The parameters.
     * @param {string} params.employeeId - The employee ID.
     * @param {string} params.employeeName - The employee name.
     * @param {Object} [options={}] - Additional options.
     * @returns {Promise<boolean>} - True if the employee was added successfully, false otherwise.
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
            await this.Employee.create(values, options);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    /**
     * Adds an employee and returns the user ID.
     * @param {Object} params - The parameters.
     * @param {string} params.employeeId - The employee ID.
     * @param {string} params.employeeName - The employee name.
     * @param {Object} [options={}] - Additional options.
     * @returns {Promise<number>} - The user ID if added successfully, -1 otherwise.
     */
    async addEmployeeReturnUserId({employeeId, employeeName}, options = {}) {
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
            const employee = await this.Employee.create(values, options);
            return employee.key;
        } catch (error) {
            console.error(error);
            return -1;
        }
    }
    
    /**
     * Gets an employee by ID.
     * @param {string} employeeId - The employee ID.
     * @returns {Promise<Object|null>} - The employee object if found, null otherwise.
     */
    async getEmployeeById(employeeId) {
        return await this.Employee.findOne({where: {id: employeeId}});
    }
    
    /**
     * Deletes an employee by name.
     * @param {string} name - The employee name.
     * @returns {Promise<boolean>} - True if the employee was deleted successfully, false otherwise.
     */
    async deleteEmployeeByName(name) {
        try {
            console.debug(`Deleting Employee: ${name}`);
            const deleteNumber = await this.Employee.destroy({
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
            const resultArray = await this.Employee.update(
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
     * @param {Object} params - The parameters.
     * @param {string} params.employeeId - The employee ID.
     * @param {string} params.employeeName - The employee name.
     * @param {string} params.feedback - The feedback content.
     * @param {Object} options - Additional options as json for model.create() method for sequelize.
     * @returns {Promise<boolean>} - True if the feedback was added successfully, false otherwise.
     */
    async addFeedback({employeeId, employeeName, feedback}, options = {}) {
        try {
            const employee = await this.Employee.findOne({
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
            await this.Feedback.create({
                                           content: feedback,
                                           employeeKey: employee.key
                                       }, options);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}


module.exports = UserService;