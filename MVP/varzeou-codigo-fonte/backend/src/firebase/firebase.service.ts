import { Injectable } from '@nestjs/common';
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
import { Storage } from '@google-cloud/storage';
import * as serviceAccountKey from './serviceAccountKey.json';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {

  storage = new Storage({
    projectId: "varzeou-c0666",
    keyFilename: "src/firebase/serviceAccountKey.json"
  });

  admin;
  bucket;

  constructor() {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey as any),
      storageBucket: 'gs://varzeou-c0666.appspot.com'
    });

    this.bucket = getStorage().bucket();
  }

  async uploadToFirebaseStorage(filepath: string, fileName: string) {
    try {
      const gcs = this.storage.bucket("gs://varzeou-c0666.appspot.com");
      const storagepath = fileName;

      const result = await gcs.upload(filepath, {
          destination: storagepath,
          public: true,
          metadata: {
            contentType: "image/*",
          }
      });

      return result[0].metadata.mediaLink;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
}

  async uploadImage(filename: string, file: Express.Multer.File) {
    return this.uploadToFirebaseStorage(file.path, filename);
  }

  async getImage(filename: string) {
    try {
      const fileRef = this.bucket.file(filename);
      const downloadURL= await getDownloadURL(fileRef);
  
      return downloadURL;
    } catch(e) {
      return 'Not found'
    }
  }

  // async getPostAttachmentURL(postId: string, email: string): Promise<string | undefined> {
  //   const fileNamePrefix = `POST-${postId}-${email}`;

  //   const [files] = await this.bucket.getFiles({ prefix: fileNamePrefix });
  //   let postAttachmentURL: string | undefined;

  //   if (files.length > 0) {
  //     const file = files[0];
  //     await file.makePublic();
  //     postAttachmentURL = file.publicUrl();
  //   }

  //   return postAttachmentURL;
  // }

  async getUserProfilePicture(email: string): Promise<string | undefined> {
    const [files] = await this.bucket.getFiles({ prefix: email });
    let profilePictureUrl: string | undefined;

    if (files.length > 0) {
      const file = files[0];
      await file.makePublic();
      profilePictureUrl = file.publicUrl();
    }

    return profilePictureUrl
  }
}