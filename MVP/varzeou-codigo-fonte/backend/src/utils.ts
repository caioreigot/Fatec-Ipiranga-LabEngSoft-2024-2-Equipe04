import { createHash, randomBytes } from 'crypto';

export class Utils {
  static hashWithSha256(str: string) {
    const hash = createHash('sha256');
    return hash.update(str).digest('hex');
  }

  static randomHexString(bytes: number) {
    return randomBytes(bytes).toString('hex');
  }

  static getFileExtension(filename) {
    const regex = /(?:\.([^.]+))?$/;
    const match = regex.exec(filename);
    return match[1] ? `.${match[1]}` : 'No extension found';
  }
}