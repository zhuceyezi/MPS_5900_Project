import multer from 'multer';


//store the picture in memory and limit the size to 15 MB
const upload = multer({
                          storage: multer.memoryStorage(),
                          limits: {fileSize: 15 * 1024 * 1024}
                      });

export default upload;
