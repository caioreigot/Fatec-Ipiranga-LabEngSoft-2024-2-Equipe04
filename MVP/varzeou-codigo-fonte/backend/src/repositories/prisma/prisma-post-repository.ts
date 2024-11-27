import { HttpCode, HttpException, Injectable } from "@nestjs/common";
import { PostRepository } from "../post-repository";
import { PrismaService } from "src/services/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/email/email.service";
import { FirebaseService } from "src/firebase/firebase.service";
import { Post, PostComment } from "@prisma/client";
import { UserRepository } from "../user-repository";
import { PostLikes, PostResponse } from "src/dtos/post-response";

@Injectable()
export class PrismaPostRepository implements PostRepository {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private firebaseService: FirebaseService,
    private userRepository: UserRepository,
  ) {}
  
  async getAll(): Promise<PostResponse[]> {
    const response: PostResponse[] = [];
    const posts = await this.prisma.post.findMany();

    for (let post of posts) {
      const author = await this.prisma.user.findUnique({ where: { id: post.userId } });
      const authorImageURL = await this.userRepository.getUserProfilePicture(author.email);
      const postAttachmentURL = await this.getPostAttachmentUrl(post.id);

      const likes: PostLikes[] = [];
      const postComments = await this.prisma.postComment.findMany({ where: { postId: post.id } });

      const likesPrisma = await this.prisma.postLikes.findMany({
        where: { postId: post.id }
      });

      // Formatando as informações sobre os likes para enviar na response
      for (let i = 0; i < likesPrisma.length; i++) {
        const likePrisma = likesPrisma[i];

        const user = await this.prisma.user.findUnique({
          where: { id: likePrisma.userId }
        });

        likes.push({ userEmail: user.email, reaction: likePrisma.reaction });
      }

      const followers = (await this.prisma.follows.findMany({
        where: { followingId: author.id }
      })).length;

      response.push({
        id: post.id,
        createdAt: post.createdAt,
        author: `${author.first_name} ${author.last_name}`,
        authorId: author.id,
        authorImageURL: authorImageURL,
        text: post.text,
        imageURL: postAttachmentURL,
        likes: likes,
        comments: postComments,
        commentsNumber: postComments.length,
        followers: followers,
      });
    }

    return response;
  }

  async getUserPosts(userId: string, isEmail: boolean = false): Promise<PostResponse[]> {
    const response: PostResponse[] = [];

    const whereObject = isEmail ? { email: userId } : { id: userId };
    const user = await this.prisma.user.findUnique({ where: whereObject });
    const posts = await this.prisma.post.findMany({
      where: { userId: user.id }
    });

    for (let post of posts) {
      const author = await this.prisma.user.findUnique({ where: { id: post.userId } });
      const authorImageURL = await this.userRepository.getUserProfilePicture(author.email);
      const postAttachmentURL = await this.getPostAttachmentUrl(post.id);

      const likes: PostLikes[] = [];
      const postComments = await this.prisma.postComment.findMany({ where: { postId: post.id } });

      const likesPrisma = await this.prisma.postLikes.findMany({
        where: { postId: post.id }
      });

      // Formatando as informações sobre os likes para enviar na response
      for (let i = 0; i < likesPrisma.length; i++) {
        const likePrisma = likesPrisma[i];

        const user = await this.prisma.user.findUnique({
          where: { id: likePrisma.userId }
        });

        likes.push({ userEmail: user.email, reaction: likePrisma.reaction });
      }

      const followers = (await this.prisma.follows.findMany({
        where: { followingId: author.id }
      })).length;

      response.push({
        id: post.id,
        createdAt: post.createdAt,
        author: `${author.first_name} ${author.last_name}`,
        authorId: author.id,
        authorImageURL: authorImageURL,
        text: post.text,
        imageURL: postAttachmentURL,
        likes: likes,
        comments: postComments,
        commentsNumber: postComments.length,
        followers: followers,
      });
    }

    return response;
  }
  
  async publishPost(email: string, text: string, file: Express.Multer.File | null): Promise<Post> {
    const user = await this.prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado.', 400);
    }

    const post = await this.prisma.post.create({
      data: {
        userId: user.id,
        text: text,
      }
    });

    return post;
  }

  async uploadPostAttachment(postId: string, filename: string, file: Express.Multer.File): Promise<string> {
    const postImageURL = await this.firebaseService.uploadImage(filename, file);

    await this.prisma.post.update({
      where: { id: postId },
      data: { attachment_image_url: postImageURL }
    });

    return postImageURL;
  }

  async getPostAttachmentUrl(postId: string): Promise<string> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    });

    return post.attachment_image_url;
  }

  async deletePost(postId: string, email: string): Promise<void> {
    await this.prisma.postLikes.deleteMany({
      where: { postId: postId }
    });

    await this.prisma.postComment.deleteMany({
      where: { postId: postId }
    });

    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: post.userId }
    });

    if (user.email == email) {
      await this.prisma.post.delete({
        where: { id: postId }
      });
    } else {
      throw new HttpException('Você só pode deletar posts publicados por você.', 400);
    }
  }

  async likePost(userEmail: string, postId: string, reaction: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail }
    });

    const alreadyLiked = (await this.prisma.postLikes.findFirst({
      where: {
        userId: user.id,
        postId: postId,
      }
    })) != null

    if (!alreadyLiked) {
      await this.prisma.postLikes.create({
        data: {
          reaction: reaction,
          postId: postId,
          userId: user.id
        }
      });
    } else {
      await this.prisma.postLikes.updateMany({
        where: {
          postId: postId,
          userId: user.id,
        },
        data: {
          reaction: reaction
        }
      });
    }
  }

  async unlikePost(userEmail: string, postId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail }
    });

    await this.prisma.postLikes.deleteMany({
      where: {
        userId: user.id,
        postId: postId
      }
    });
  }

  async getFollowingPosts(email: string): Promise<PostResponse[]> {
    const response: PostResponse[] = [];

    const user = await this.prisma.user.findUnique({ where: { email: email } });
    const userFollows = await this.prisma.follows.findMany({ where: { followerId: user.id } });
    const followingIds = userFollows.map((userFollow) => userFollow.followingId);

    for (let i = 0; i < followingIds.length; i++) {
      const followingId = followingIds[i];

      const posts = await this.prisma.post.findMany({
        where: { userId: followingId }
      });
  
      for (let post of posts) {
        const author = await this.prisma.user.findUnique({ where: { id: post.userId } });
        const authorImageURL = await this.userRepository.getUserProfilePicture(author.email);
        const postAttachmentURL = await this.getPostAttachmentUrl(post.id);
  
        const likes: PostLikes[] = []
        const postComments = await this.prisma.postComment.findMany({ where: { postId: post.id } });
  
        const likesPrisma = await this.prisma.postLikes.findMany({
          where: { postId: post.id }
        });
  
        // Formatando as informações sobre os likes para enviar na response
        for (let i = 0; i < likesPrisma.length; i++) {
          const likePrisma = likesPrisma[i];
  
          const user = await this.prisma.user.findUnique({
            where: { id: likePrisma.userId }
          });
  
          likes.push({ userEmail: user.email, reaction: likePrisma.reaction });
        }
  
        const followers = (await this.prisma.follows.findMany({
          where: { followingId: author.id }
        })).length;
  
        response.push({
          id: post.id,
          createdAt: post.createdAt,
          author: `${author.first_name} ${author.last_name}`,
          authorId: author.id,
          authorImageURL: authorImageURL,
          text: post.text,
          imageURL: postAttachmentURL,
          likes: likes,
          comments: postComments,
          commentsNumber: postComments.length,
          followers: followers,
        });
      }
    }

    return response;
  }

  async comment(email: string, postId: string, text: string): Promise<PostComment> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new HttpException('O post não existe.', 400)
    }

    return await this.prisma.postComment.create({
      data: {
        text: text,
        userFullname: `${user.first_name} ${user.last_name}`,
        postId: postId,
        userId: user.id,
        userProfilePicture: user.profile_picture_url
      }
    });
  }

  async getComments(postId: string): Promise<PostComment[]> {
    return await this.prisma.postComment.findMany({ where: { postId: postId } });
  }
}