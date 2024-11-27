import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {

  constructor(private mailerService: MailerService) {}

  async sendPasswordRecoveryEmail(email: string, username: string, roomUrl: string) {
    await this.mailerService.sendMail({
      to: email,
      /*from: 'email@gmail.com',*/
      subject: 'Varzeou! - Recuperação de Senha',
      html: `<p>Olá, <b>${username}</b>! Clique <a href="${roomUrl}">aqui</a> para redefinir sua senha em nosso site.</p>`,
    });
  }

  async sendConfirmAccountEmail(email: string, username: string, roomId: string) {
    const roomUrl = `http://54.94.73.68/#/confirm-account/${roomId}`;

    await this.mailerService.sendMail({
      to: email,
      /*from: 'email@gmail.com',*/
      subject: 'Varzeou! - Confirmar cadastro',
      html: `<h2>Olá, <b>${username}</b>! Clique <a href="${roomUrl}">aqui</a> para confirmar o cadastro de sua conta.</h2>`,
    });
  }
}