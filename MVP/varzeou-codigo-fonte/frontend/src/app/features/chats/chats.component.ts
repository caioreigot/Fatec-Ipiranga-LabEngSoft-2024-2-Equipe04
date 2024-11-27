import { Component, OnInit } from '@angular/core';
import { subscribe } from 'diagnostics_channel';
import { finalize } from 'rxjs';
import { ChatPreview } from 'src/app/models/ChatPreview';
import { BackendService } from 'src/app/shared/services/backend.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html'
})
export class ChatsComponent implements OnInit {

  chatPreviewsFetched = false;
  profilePictureUrl: string | null = null;
  chatPreviews: ChatPreview[] = []

  constructor(
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    this.backendService.getProfilePicture().subscribe((res) => {
      this.profilePictureUrl = res.imageURL;
    });

    this.backendService.getChats().pipe(
      finalize(() => {
        this.chatPreviewsFetched = true;
      })
    ).subscribe({
      next: (response: any) => {
        this.chatPreviews = response;
      }
    });
  }
}
