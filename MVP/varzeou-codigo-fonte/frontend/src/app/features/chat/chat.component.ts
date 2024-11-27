import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/User';
import { BackendService } from 'src/app/shared/services/backend.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  
  userId: string | null = null;
  user: User | null = null;
  messages: any[] = [];
  novaMensagem: string = '';

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private backendService: BackendService,
    private localStorageService: LocalStorageService,
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(urlSegments => {
      this.userId = urlSegments[1]?.path;

      this.backendService.getUser(this.userId).subscribe((response) => {
        this.user = response as any;
      });

      this.getMessages(this.userId);
    });
  }

  getMessages(userId: string) {
    this.backendService.getChatMessages(userId).subscribe({
      next: (response: any) => {
        response.forEach((message: any) => {
          message.ownMessage = message.senderFullname == this.localStorageService.getUserPayload()!.fullname
        });

        this.messages = response;

        setTimeout(() => {
          this.scrollToBottom(false);
        }, 1);
      }
    });
  }

  enviarMensagem() {
    if (!this.novaMensagem.trim()) {
      return;
    }

    if (this.user) {
      this.backendService.sendMessage(this.novaMensagem, this.user.id).subscribe({
        next: (response: any) => {
          response.ownMessage = response.senderFullname == this.localStorageService.getUserPayload()!.fullname
          this.messages.push(response);

          setTimeout(() => {
            this.scrollToBottom();
          }, 1);
        }
      });
    }

    if (this.novaMensagem.trim()) {
      this.novaMensagem = ''; // Limpa o campo de entrada
    }
  }

  scrollToBottom(smooth = true): void {
    try {
      this.chatContainer.nativeElement.scrollTo({
        top: this.chatContainer.nativeElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant' // Habilita o scroll suave
      });
    } catch (err) {
      console.error('Erro ao scrollar o container:', err);
    }
  }
}
