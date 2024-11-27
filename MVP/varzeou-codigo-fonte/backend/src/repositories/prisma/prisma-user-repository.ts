import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { AuthService } from 'src/auth/shared/auth.service';
import { UserRepository } from '../user-repository';
import { Utils } from 'src/utils';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserProfileResponse } from 'src/dtos/user-profile-response';
import { Message, User } from '@prisma/client';
import { ChatPreview } from 'src/dtos/chat-preview-response';
import { ChatMessageResponse } from 'src/dtos/chat-message-response';

@Injectable()
export class PrismaUserRepository implements UserRepository {

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private firebaseService: FirebaseService,
  ) {}

  async buildAndSendToken(email: string): Promise<{ access_token: string; }> {
    const user = await this.prisma.user.findFirst({
      where: { email: email }
    });

    const fullname = user.first_name + ' ' + user.last_name;
    return this.authService.buildAndSendToken(fullname, user.email);
  }

  async create(
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ): Promise<void> {
    const emailAlreadyInUse = await this.prisma.user.findUnique({ where: { email: email } }) != null;

    if (emailAlreadyInUse) {
      throw new HttpException('Este e-mail já está em uso.', 409)
    }

    const passwordHash = Utils.hashWithSha256(password);

    const userToConfirm = await this.prisma.userToConfirm.create({
      data: {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password_hash: passwordHash,
      }
    });

    await this.emailService.sendConfirmAccountEmail(email, first_name, userToConfirm.roomId)
  }

  async confirmAccount(room_id: string): Promise<void> {
    this.prisma.userToConfirm.findFirst({
      where: {
        roomId: room_id
      }
    }).then(async (user) => {
      if (!user) {
        return;
      }

      await this.prisma.user.create({
        data: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password_hash: user.password_hash
        }
      });

      await this.prisma.userToConfirm.deleteMany({
        where: {
          roomId: room_id
        }
      });
    });

    return;
  }

  async getProfile(email: string, userId: string, isEmail: boolean = false): Promise<Partial<UserProfileResponse>> {
    const whereObject = isEmail ? { email: userId } : { id: userId };

    const requester = await this.prisma.user.findUnique({ where: { email: email } });
    const user = await this.prisma.user.findUnique({ where: whereObject });

    const userPosts = await this.prisma.post.findMany({ where: { userId: user.id } })
    const attachments = userPosts.map((post) => post.attachment_image_url).filter((post) => post != null);

    const isFollowing = (await this.prisma.follows.findFirst({
      where: {
        followerId: requester.id,
        followingId: user.id
      }
    })) != null;

    return {
      id: user.id,
      fullname: `${user.first_name} ${user.last_name}`,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture_url: user.profile_picture_url,
      soccer_role: user.soccer_role,
      following: isFollowing,
      attachments: attachments
    }
  }

  async loginWithToken(token: string): Promise<{ access_token: string; }> {
    const jwt = token.replace('Bearer ', '');

    try {
      this.jwtService.verify(jwt);
    } catch (error: any) {
      throw new ForbiddenException('O token fornecido não é válido.');
    }

    const jwtDecoded: any = this.jwtService.decode(jwt);

    const user = await this.prisma.user.findFirst({
      where: { email: jwtDecoded.email }
    });

    if (!user) {
      throw new HttpException('O usuário do token não existe mais.', HttpStatus.BAD_REQUEST);
    }

    const payload = {
      name: jwtDecoded.name,
      email: jwtDecoded.email,
    };

    // Renova o token para durar mais '12h'
    const options = { expiresIn: '12h' };
    return { access_token: this.jwtService.sign(payload, options) };
  }

  async uploadProfilePicture(userEmail: string, filename: string, file: Express.Multer.File): Promise<string> {
    const imageURL = await this.firebaseService.uploadImage(filename, file);

    await this.prisma.user.update({
      where: { email: userEmail },
      data: { profile_picture_url: imageURL }
    });

    return imageURL;
  }

  async getUserProfilePicture(email: string): Promise<string | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email }
      });

      return user.profile_picture_url
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return null;
    }
  }

  async setUserSoccerRole(email: string, role: string): Promise<void> {
    await this.prisma.user.update({
      where: { email: email },
      data: { soccer_role: role }
    });
  }

  async getUserSoccerRole(email: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { email: email }
    });

    return user.soccer_role;
  }

  async getUserIdByEmail(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    return user.id
  }

  async toggleFollow(followerEmail: string, followingId: string) {
    const followerId = (await this.prisma.user.findUnique({ where: { email: followerEmail } })).id;
    const follow = await this.prisma.follows.findFirst({ where: { followerId: followerId, followingId: followingId } });

    if (!follow) {
      await this.prisma.follows.create({
        data: {
          followerId: followerId,
          followingId: followingId
        }
      });
    } else {
      await this.prisma.follows.deleteMany({
        where: {
          followerId: followerId,
          followingId: followingId
        }
      });
    }
  }

  async sendMessage(text: string, senderUserId: string, receiverUserId: string): Promise<ChatMessageResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: senderUserId } });
  
    const message = await this.prisma.message.create({
      data: {
        text: text,
        senderProfilePicture: user.profile_picture_url,
        sender: { connect: { id: senderUserId } },
        receiver: { connect: { id: receiverUserId } },
      },
    });

    const receiverFullname = await this.prisma.user.findUnique({ where: { id: message.receiverId } }); 
    const senderFullname = await this.prisma.user.findUnique({ where: { id: message.senderId } }); 

    const toReturn: ChatMessageResponse = {
      ...message,
      receiverFullname: `${receiverFullname.first_name} ${receiverFullname.last_name}`,
      senderFullname: `${senderFullname.first_name} ${senderFullname.last_name}`,
    }

    return toReturn;
  }  

  async getChats(email: string): Promise<ChatPreview[]> {
    const toReturn: ChatPreview[] = [];
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          /* Mensagens que o usuário da request recebeu ou mandou
          Qualquer uma dessas alternativas gera um chat em sua tela de chats */
          { senderId: user.id },
          { receiverId: user.id },
        ]
      }
    });

    // Ordena as mensagens para que a mais recente esteja no índice 0
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const chatsAlreadyCreated_ids = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Vẽ com qual pessoa o usuário está conversando (não pode ser ele mesmo, então filtramos o array)
      const talkingTo_id = [message.receiverId, message.senderId].filter((id) => id != user.id)[0];

      // Se o chat preview desse usuário já foi criado, pula pra próxima iteração
      if (chatsAlreadyCreated_ids.includes(talkingTo_id)) {
        continue;
      }

      const talkingTo_user = await this.prisma.user.findUnique({ where: { id: talkingTo_id } });

      toReturn.push({
        talkingToId: talkingTo_id,
        fullname: `${talkingTo_user.first_name} ${talkingTo_user.last_name}`,
        userProfilePictureUrl: talkingTo_user.profile_picture_url,
        chatLastMessage: message.text,
        chatLastMessageAuthor: message.senderId == talkingTo_id ? talkingTo_user.first_name : 'Você'
      });

      chatsAlreadyCreated_ids.push(talkingTo_id);
    }

    return toReturn;
  }

  async getChatMessages(requesterUserId: string, targetUserId: string): Promise<ChatMessageResponse[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: requesterUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: requesterUserId },
        ]
      }
    });

    const toReturn: ChatMessageResponse[] = []

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      const receiverFullname = await this.prisma.user.findUnique({ where: { id: message.receiverId } }); 
      const senderFullname = await this.prisma.user.findUnique({ where: { id: message.senderId } }); 

      toReturn.push({
        ...message,
        receiverFullname: `${receiverFullname.first_name} ${receiverFullname.last_name}`,
        senderFullname: `${senderFullname.first_name} ${senderFullname.last_name}`,
      });
    }

    return toReturn;
  }

  async getUser(userId: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    delete user.password_hash;
    delete user.email;

    return user;
  }
}