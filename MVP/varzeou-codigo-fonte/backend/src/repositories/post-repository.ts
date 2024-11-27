import { Post, PostComment } from "@prisma/client";
import { PostResponse } from "src/dtos/post-response";

export abstract class PostRepository {
  abstract getAll(): Promise<PostResponse[]>;
  abstract getUserPosts(userId: string, isEmail?: boolean): Promise<PostResponse[]>;
  abstract getFollowingPosts(email: string): Promise<PostResponse[]>;
  abstract publishPost(email: string, text: string, file: Express.Multer.File | null): Promise<Post>;
  abstract deletePost(postId: string, email: string): Promise<void>;
  abstract uploadPostAttachment(postId: string, filename: string, file: Express.Multer.File): Promise<string>;
  abstract getPostAttachmentUrl(postId: string): Promise<string>;
  abstract likePost(userEmail: string, postId: string, reaction: string): Promise<void>;
  abstract unlikePost(userEmail: string, postId: string): Promise<void>;
  abstract comment(email: string, postId: string, text: string): Promise<PostComment>;
  abstract getComments(postId: string): Promise<PostComment[]>;
}