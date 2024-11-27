import { PostComment } from "@prisma/client";

export interface PostLikes {
  userEmail: string;
  reaction: string;
}

export interface PostResponse {
  id: string;
  createdAt: Date;
  author: string;
  authorId: string;
  authorImageURL: string;
  text: string;
  imageURL: string | null;
  likes: PostLikes[];
  comments: PostComment[];
  followers: number;
  commentsNumber: number;
}
