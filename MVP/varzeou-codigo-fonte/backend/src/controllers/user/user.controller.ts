import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfirmAccountBody } from 'src/dtos/confirm-account-body';
import { UserRepository } from 'src/repositories/user-repository';
import { UserBody } from 'src/dtos/user-body';
import { LocalAuthGuard } from 'src/auth/shared/guards/local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/shared/guards/jwt-auth.guard';
import { Utils } from 'src/utils';
import multerConfig from 'src/config/multer.config';
import * as jwt from 'jsonwebtoken';
import { UpdateSoccerRoleBody } from 'src/dtos/update-soccer-role-body';
import { PostRepository } from 'src/repositories/post-repository';
import { SendMessageBody } from 'src/dtos/send-message-body';

@Controller('user')
export class UserController {

  constructor(
    private userRepository: UserRepository,
    private postRepository: PostRepository
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request: any): Promise<{ access_token: string; profile_picture_url: string | null }> {
    const userEmail = request.user.email;
  
    try {
      const profile_picture_url = await this.userRepository.getUserProfilePicture(userEmail)
      const { access_token } = await this.userRepository.buildAndSendToken(userEmail);

      return { access_token, profile_picture_url };
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      const { access_token } = await this.userRepository.buildAndSendToken(userEmail);
      
      return { access_token, profile_picture_url: null };
    }
  }

  @Get('login')
  @UseGuards(JwtAuthGuard)
  validateToken() {
    return;
  }

  @Post('create')
  async create(@Body() body: UserBody): Promise<void> {
    try {
      await this.userRepository.create(
        body.first_name,
        body.last_name,
        body.email,
        body.password,
      );
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new HttpException(
          'Este e-mail já está em uso! Por favor, escolha outro.',
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  @Post('confirm-account')
  async confirmAccount(@Body() body: ConfirmAccountBody): Promise<void> {
    try {
      await this.userRepository.confirmAccount(body.room_id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Ocorreu um erro ao confirmar a criação da conta.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('get-profile/:userid')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() request: any,
    @Param('userid') userId: string,
  ) {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;

      if (userId == 'me') {
        const posts = await this.postRepository.getUserPosts(email, true);
        const profile = await this.userRepository.getProfile(email, email, true);
        profile['own_profile'] = true;
        profile['posts'] = posts;
        
        return profile;
      }

      const posts = await this.postRepository.getUserPosts(userId)
      const profile = await this.userRepository.getProfile(email, userId);
      const emailUserId = await this.userRepository.getUserIdByEmail(email);

      profile['own_profile'] = emailUserId == profile.id;
      profile['posts'] = posts;
      return profile;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Ocorreu um erro ao trazer as informações do perfil.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload-profile-pic')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @UseGuards(JwtAuthGuard)
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any
  ): Promise<{ imageURL: string }> {
    try {
      if (!file) {
        throw new HttpException(
          'Você precisa fornecer uma imagem.',
          HttpStatus.BAD_REQUEST
        );
      }

      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email
      const fileExtension = Utils.getFileExtension(file.filename)
      const fileName = `${email}${fileExtension}`

      const imageURL = await this.userRepository.uploadProfilePicture(email, fileName, file);
      return { imageURL }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Ocorreu um erro ao fazer o upload da imagem.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('get-profile-pic')
  @UseGuards(JwtAuthGuard)
  async getProfilePicture(
    @Req() request: any
  ): Promise<{ imageURL: string }> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email

      const imageURL = await this.userRepository.getUserProfilePicture(email)
      return { imageURL }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Ocorreu um erro ao trazer a imagem.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('set-soccer-role')
  @UseGuards(JwtAuthGuard)
  async setUserSoccerRole(@Req() request: any, @Body() body: UpdateSoccerRoleBody): Promise<void> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email
      await this.userRepository.setUserSoccerRole(email, body.role);
    } catch (error) {
      throw new HttpException(
        `Ocorreu um erro ao definir a função do jogador.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('get-soccer-role')
  @UseGuards(JwtAuthGuard)
  async getUserSoccerRole(@Req() request: any): Promise<{ role: string }> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email      
      const role = await this.userRepository.getUserSoccerRole(email);
      return { role };
    } catch (error) {
      throw new HttpException(
        `Ocorreu um erro ao consultar a função do jogador.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('toggle-follow/:userid')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(
    @Req() request: any,
    @Param('userid') userId: string,
  ) {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;
  
      await this.userRepository.toggleFollow(email, userId);
    } catch(e) {
      throw new HttpException(
        `Ocorreu um erro inesperado ao trocar o status de follow.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('send-message')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Req() request: any,
    @Body() body: SendMessageBody,
  ) {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email
      const senderId = await this.userRepository.getUserIdByEmail(email);
  
      const message = await this.userRepository.sendMessage(body.text, senderId, body.to);
      return message;
    } catch(e) {
      throw new HttpException(
        `Ocorreu um erro ao enviar a mensagem ao usuário.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('get-chat-messages/:userid')
  @UseGuards(JwtAuthGuard)
  async getChatMessages(
    @Req() request: any,
    @Param('userid') targetUserId: string,
  ) {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;
      const requesterUserId = await this.userRepository.getUserIdByEmail(email);
  
      const messages = await this.userRepository.getChatMessages(requesterUserId, targetUserId);
      return messages;
    } catch (e) {
      throw new HttpException(
        `Ocorreu um erro ao coletar as mensagens do usuário.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('get-chats')
  @UseGuards(JwtAuthGuard)
  async getChats(@Req() request: any) {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;

      return this.userRepository.getChats(email);
    } catch (e) {
      throw new HttpException(
        `Ocorreu um erro ao coletar mensagens do usuário.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':userid')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('userid') userId: string) {
    try {
      return await this.userRepository.getUser(userId);
    } catch (e) {
      throw new HttpException(
        `Ocorreu um erro ao coletar informações de um usuário.`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
