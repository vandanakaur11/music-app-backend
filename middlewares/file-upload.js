const multer = require("multer");

const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
    "application/pdf": "pdf",
    "application/doc": "doc",
    "application/docx": "docx",
    "application/ppt": "ppt",
    "application/pptx": "pptx",
    "application/xls": "xls",
    "application/xlsx": "xlsx",
};

const fileUpload = multer({
    limits: 12000000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/files");
        },
        filename: (req, file, cb) => {
            req.userData = { fileKey: uuidv4() + file.originalname.replace(/\s/g, "-") };
            // cb(null, req.body.userId + uuidv4() + file.originalname);
            cb(null, uuidv4() + file.originalname.replace(" ", "-"));
        },
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        //  console.log("MIME_TYPE_MAP[file.mimetype]");
        let error = isValid ? null : new Error("Invalid Filetype");
        cb(error, isValid);
    },
});

module.exports = fileUpload;
