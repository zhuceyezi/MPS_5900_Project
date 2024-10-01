require("dotenv").config({ path: "../../.env" });
const { Employee, database } = require("../models");
const { Op } = require("sequelize");
const addSampleEmployee = async () => {
  try {
    const values = {
      imageId: "1234",
      employeeName: "Liang Han",
      lastLogin: new Date(),
      employeeId: "123456",
    };
    console.log(values);
    const newEmployee = await Employee.create(values);
    console.log(newEmployee.dataValues);
  } catch (error) {
    console.log(error);
  }
};
exports.addSampleEmployee = addSampleEmployee;

/**
 *
 * @param employeeId
 * @param employeeName
 * @param imageId
 * @returns {Promise<boolean>}
 */
async function addEmployee({ employeeId, employeeName, imageId }) {
  try {
    console.debug(
      `Adding Employee: ${JSON.stringify(
        {
          employeeId,
          employeeName,
          imageId,
        },
        null,
        2,
      )}`,
    );
    const values = {
      imageId: imageId,
      name: employeeName,
      lastLogin: new Date(),
      employeeId: employeeId,
    };
    await Employee.create(values);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

exports.addEmployee = addEmployee;

/**
 *
 * @param name
 * @returns {Promise<boolean>}
 */
async function deleteEmployeeByName(name) {
  try {
    console.debug(`Deleting Employee: ${name}`);
    await Employee.destroy({
      where: {
        name: name,
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

exports.deleteEmployeeByName = deleteEmployeeByName;

/**
 *
 * @param employeeId
 * @param lastLogin
 * @param employeeName
 * @param imageId
 * @param id
 * @returns {Promise<boolean>}
 */
async function updateEmployee({
  employeeId,
  lastLogin,
  employeeName,
  imageId,
} = {}) {
  try {
    console.debug(
      `Updating Employee: ${JSON.stringify(
        {
          employeeId,
          lastLogin,
          employeeName,
          imageId,
          lastLogin,
        },
        null,
        2,
      )}`,
    );
    if (employeeId === undefined) {
      throw new Error(`employeeId should be defined`);
    }
    await Employee.update(
      {
        imageId: imageId,
        lastLogin: lastLogin,
        employeeName: employeeName,
        employeeId: employeeId,
      },
      {
        where: {
          employeeId: employeeId,
        },
      },
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

// connect and syc to the database
database
  .authenticate()
  .then(async () => {
    database
      .sync()
      .then(async () => {
        // await addSampleEmployee();
        const ok = await updateEmployee({
          imageId: "1234idid",
          employeeId: 123456,
        });
        if (!ok) return false;
        console.log("successful connect to database and sync the schemas");
      })
      .catch((err) => {
        console.log("error during the sync the model process");
        console.log(err);
      });
  })
  .catch((err) => {
    console.log("error when connecting to database");
    console.log(err);
  });
