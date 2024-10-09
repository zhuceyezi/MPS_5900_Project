require("dotenv").config({path: "../../.env"});
const {Op} = require("sequelize");


class UserService {
    
    constructor(EmployeeModel) {
        this.Employee = EmployeeModel
    }
    
    /**
     *
     * @param employeeId
     * @param employeeName
     * @param imageId
     * @returns {Promise<boolean>}
     */
    async addEmployee({employeeId, employeeName, imageId}) {
        try {
            console.debug(
                `Adding Employee: ${JSON.stringify(
                    /** @type Employee*/
                    {
                        employeeId,
                        employeeName,
                        imageId
                    },
                    null,
                    2
                )}`
            );
            const values = {
                imageId: imageId,
                employeeName: employeeName,
                lastLogin: new Date(),
                employeeId: employeeId
            };
            await this.Employee.create(values);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    //I think it should be deleteEmployeeById
    /**
     *
     * @param name
     * @returns {Promise<boolean>}
     *
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
     *
     * @param employeeId
     * @param lastLogin
     * @param employeeName
     * @param imageId
     * @param id
     * @returns {Promise<boolean>}
     */
    async updateEmployee({
                             employeeId,
                             lastLogin,
                             employeeName,
                             imageId
                         } = {}) {
        try {
            console.debug(
                `Updating Employee: ${JSON.stringify(
                    {
                        employeeId,
                        lastLogin,
                        employeeName,
                        imageId
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
                    imageId: imageId,
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
    
    
}


module.exports = UserService;


