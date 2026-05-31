import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import path from 'path';
import { ensureUploadDir } from '../helpers/uploadProductImage';

ensureUploadDir();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(process.cwd(), 'public', 'images'))
  },
  filename: function (req, file, cb) {
    const newFileName=uuidv4() + path.extname(file.originalname)
    cb(null, newFileName)
  }
})

export const upload = multer({ storage: storage })