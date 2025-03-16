import multer from "multer"
import config from 'config'

const {ALLOWED_TYPES, MAX_FILE_SIZE} = config.get('MULTER')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only CSV and XLSX are allowed."), false)
  }
  
  cb(null, true)
}

export const singleUploadConfig = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE }, 
  fileFilter: fileFilter
}).single("file") 