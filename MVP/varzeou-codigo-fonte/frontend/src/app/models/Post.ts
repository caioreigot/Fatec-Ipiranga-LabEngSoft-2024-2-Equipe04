import { PostComment } from "./PostComment";

export interface PostLikes {
  userEmail: string;
  reaction: string;
}

export interface Post {
  id: string;
  createdAt: string;
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