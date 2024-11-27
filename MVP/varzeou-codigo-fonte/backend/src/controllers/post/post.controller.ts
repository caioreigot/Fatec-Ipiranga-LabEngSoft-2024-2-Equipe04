import multerConfig from 'src/config/multer.config';
import * as jwt from 'jsonwebtoken';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/shared/guards/jwt-auth.guard';
import { PostRepository } from 'src/repositories/post-repository';
import { Utils } from 'src/utils';
import { PostLikeBody } from 'src/dtos/post-like-body';
import { PostUnlikeBody } from 'src/dtos/post-unline-body';
import { PublicationBody } from 'src/dtos/publication-body';
import { PostResponse } from 'src/dtos/post-response';
import { CommentBody } from 'src/dtos/comment-body';

@Controller('post')
export class PostController {

  constructor(private postRepository: PostRepository) {}

  @Get('all')
  async getAll(): Promise<PostResponse[]> {
    try {
      return this.postRepository.getAll();
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar os posts.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@Req() request: any): Promise<PostResponse[]> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;
      return this.postRepository.getUserPosts(email, true);
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar seus próprios posts.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('all/:userid')
  @UseGuards(JwtAuthGuard)
  async getUserPosts(@Param('userid') userId: string): Promise<PostResponse[]> {
    try {
      return this.postRepository.getUserPosts(userId);
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar posts do usuário.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  @Post('publish')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @UseGuards(JwtAuthGuard)
  async publishPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: PublicationBody,
    @Req() request: any,
  ): Promise<{ text: string, imageURL: string }> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email

      const post = await this.postRepository.publishPost(email, body.text, file || null);

      if (file) {
        const fileExtension = Utils.getFileExtension(file.filename)
        const fileName = `POST-${post.id}-${email}${fileExtension}`
        const postImageURL = await this.postRepository.uploadPostAttachment(post.id, fileName, file)

        return { text: post.text, imageURL: postImageURL }
      }

      return { text: post.text, imageURL: null }
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Param('id') postId: string,
    @Req() request: any
  ): Promise<{ message: string }> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;

      await this.postRepository.deletePost(postId, email);

      return { message: 'Post excluído com sucesso' };
    } catch (error) {
      throw new HttpException(
        'Erro ao deletar o post.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('like')
  @UseGuards(JwtAuthGuard)
  async likePost(@Body() body: PostLikeBody, @Req() request: any): Promise<void> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email

      await this.postRepository.likePost(email, body.postId, body.reaction);
    } catch (error) {
      throw new HttpException(
        'Erro ao curtir o post.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('unlike')
  @UseGuards(JwtAuthGuard)
  async unlikePost(@Body() body: PostUnlikeBody, @Req() request: any): Promise<void> {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email

      await this.postRepository.unlikePost(email, body.postId);
    } catch (error) {
      throw new HttpException(
        'Erro ao remover a curtida do post.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('following/posts')
  @UseGuards(JwtAuthGuard)
  async getFollowsPost(@Req() request: any) {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;
      return await this.postRepository.getFollowingPosts(email);
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar posts das pessoas que você segue.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('comment')
  @UseGuards(JwtAuthGuard)
  async comment(
    @Req() request: any,
    @Body() body: CommentBody
  ) {
    try {
      const rawToken = request.headers['authorization'].split(' ')[1];
      const email = (jwt.decode(rawToken) as any).email;
      return await this.postRepository.comment(email, body.postId, body.text);
    } catch (error) {
      throw new HttpException(
        'Erro ao criar comentário no post.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('comment/:postid')
  @UseGuards(JwtAuthGuard)
  async getComments(
    @Param('postid') postId: string,
  ) {
    try {
      return await this.postRepository.getComments(postId);
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar comentários do post.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
