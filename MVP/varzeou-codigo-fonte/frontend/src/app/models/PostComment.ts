export interface PostComment {
  id: number;
  createdAt: string;
  postId: string;
  text: string;
  userFullname: string;
  userId: string;
  userProfilePicture: string | null;
}