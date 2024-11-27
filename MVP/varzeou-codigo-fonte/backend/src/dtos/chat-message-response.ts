export interface ChatMessageResponse {
  id: number;
  createdAt: Date;
  senderFullname: string;
  receiverFullname: string;
  senderId: string;
  receiverId: string;
  senderProfilePicture: string | null;
  text: string;
}