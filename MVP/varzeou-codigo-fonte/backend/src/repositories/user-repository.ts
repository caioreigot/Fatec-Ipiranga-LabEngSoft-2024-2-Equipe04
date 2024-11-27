import { User } from "@prisma/client";
import { ChatMessageResponse } from "src/dtos/chat-message-response";
import { ChatPreview } from "src/dtos/chat-preview-response";
import { UserProfileResponse } from "src/dtos/user-profile-response";

export abstract class UserRepository {
  abstract buildAndSendToken(email: string): Promise<{ access_token: string }>;
  abstract loginWithToken(token: string): Promise<{ access_token: string }>;
  abstract create(first_name: string, last_name: string, email: string, password: string): Promise<void>;
  abstract confirmAccount(room_id: string): Promise<void>;
  abstract getProfile(email: string, userId: string, isEmail?: boolean): Promise<Partial<UserProfileResponse>>;
  abstract uploadProfilePicture(userEmail: string, filename: string, file: Express.Multer.File): Promise<string>;
  abstract getUserProfilePicture(email: string): Promise<string | null>;
  abstract setUserSoccerRole(email: string, role: string): Promise<void>;
  abstract getUserSoccerRole(email: string): Promise<string>;
  abstract getUserIdByEmail(email: string): Promise<string>;
  abstract toggleFollow(followerEmail: string, followingId: string): Promise<void>;
  abstract getUser(userId: string): Promise<Partial<User>>;
  abstract sendMessage(text: string, senderUserId: string, receiverUserId: string): Promise<ChatMessageResponse>;
  abstract getChats(email: string): Promise<ChatPreview[]>
  abstract getChatMessages(requesterUserId: string, targetUserId: string): Promise<ChatMessageResponse[]>
}