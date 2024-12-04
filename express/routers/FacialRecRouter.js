const express = require('express');
const router = express.Router();

module.exports = (userService, awsService, facialRecService,
                  facialRecController,
                  upLoad) => {
    //POST /employees
    router.post('/', (req, res, next) => {
        upLoad.single('image')(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err); // Log the Multer error
                return res.status(500).json({error: err.message});
            }
            console.log('hit'); // This will print if there’s no error
            facialRecController.addEmployee(req, res);
        });
    });
    
    
    //POST /employees/validate
    router.post('/validate', upLoad.single('image'), (req, res) => facialRecController.validateEmployee(req, res));
    router.delete('/all', (req, res) => facialRecController.deleteAllFaces(req, res));
    
    return router;
}