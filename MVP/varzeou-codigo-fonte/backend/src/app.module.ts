import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './controllers/user/user.controller';
import { UserRepository } from './repositories/user-repository';
import { PrismaUserRepository } from './repositories/prisma/prisma-user-repository';
import { PrismaService } from './services/prisma.service';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './email/email.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PostController } from './controllers/post/post.controller';
import { PostRepository } from './repositories/post-repository';
import { PrismaPostRepository } from './repositories/prisma/prisma-post-repository';
import { join } from 'path';
import { static as static_ } from 'express'

const ConfiguredServeStaticModule = ServeStaticModule.forRoot({
  rootPath: join(__dirname, 'front'),
});

const UseUserRepositoryWithPrisma = {
  provide: UserRepository,
  useClass: PrismaUserRepository,
};

const UsePostRepositoryWithPrisma = {
  provide: PostRepository,
  useClass: PrismaPostRepository,
};

/* Criando o módulo do JWT com o secret da variável de ambiente */
const JwtRegistered = JwtModule.register({ secret: process.env.JWT_SECRET });

/* Configurações pro SMTP do Gmail */
const mailerModuleOptions = {
  transport: {
    host: 'smtp.gmail.com',
    secure: false,
    port: 587,
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASSWORD,
    },
    ignoreTLS: false,
  },
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot(mailerModuleOptions),
    ConfiguredServeStaticModule,
    AuthModule,
    JwtRegistered,
    EmailModule,
    FirebaseModule,
  ],
  controllers: [
    UserController,
    PostController
  ],
  providers: [
    AppService,
    PrismaService,
    UseUserRepositoryWithPrisma,
    UsePostRepositoryWithPrisma,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Serve a aplicação Angular
    const staticPath = join(__dirname, '..', 'frontend');
    consumer
      .apply(static_(staticPath))
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
