import { diskStorage } from 'multer';
import { resolve as path_resolve } from 'path';
import { randomBytes } from 'crypto';

const tmpFolder = path_resolve(__dirname, '..', '..', 'tmp'); 

export default {
  directory: tmpFolder,
  storage: diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      const fileHash = randomBytes(10).toString('hex');
      const filename = `${fileHash}-${file.originalname}`;
      return callback(null, filename);
    }
  }),
}