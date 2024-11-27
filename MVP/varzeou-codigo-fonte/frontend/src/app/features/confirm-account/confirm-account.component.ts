import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/shared/services/backend.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirm-account',
  templateUrl: './confirm-account.component.html',
})
export class ConfirmAccountComponent implements OnInit {

  constructor(
    private backendService: BackendService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const roomId = this.activeRoute.snapshot.paramMap.get('id');
    this.backendService.confirmAccount(roomId || '').subscribe();
  }
}
