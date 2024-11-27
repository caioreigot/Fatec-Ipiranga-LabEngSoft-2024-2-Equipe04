import { Component, OnInit } from '@angular/core';
import { BackendService } from './shared/services/backend.service';
import { Router, NavigationEnd } from '@angular/router';
import { LocalStorageService } from './shared/services/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  currentRoute: string | null = null;

  constructor(
    private backendService: BackendService,
    private localStorageService: LocalStorageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const tokenStillValid = (isValid: boolean) => {
      if (!isValid) {
        this.localStorageService.clearProfilePictureUrl();
        this.localStorageService.clearToken();
        this.router.navigate(['/login']);
      }
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Atualiza "currentRoute" com a rota da página atual
        this.currentRoute = event.urlAfterRedirects;

        if (this.currentRoute && !this.currentRoute.includes('/confirm-account')) {
          this.backendService.tokenStillValid(tokenStillValid);
        }
      }
    });
  }
}