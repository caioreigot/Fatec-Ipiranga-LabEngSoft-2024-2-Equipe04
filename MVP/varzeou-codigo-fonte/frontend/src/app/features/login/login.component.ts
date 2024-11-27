import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { BackendService } from 'src/app/shared/services/backend.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  
  passwordState: 'hidden' | 'visible' = 'hidden'
  loginInProgress = false;

  constructor(
    private backendService: BackendService,
    private snackbarService: SnackbarService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.localStorageService.clearProfilePictureUrl();
  }

  onPasswordVisibilityClick() {
    if (this.passwordState == 'hidden') this.passwordState = 'visible'
    else if (this.passwordState == 'visible') this.passwordState = 'hidden'
  }

  onEnterClick(email: string, password: string) {
    if (this.loginInProgress == true) return;

    this.loginInProgress = true;

    this.backendService.login(email, password)
      .pipe(finalize(() => { this.loginInProgress = false; }))
      .subscribe({
        error: (errorResponse: HttpErrorResponse) => {
          let message = errorResponse.error.message instanceof Array 
            ? errorResponse.error.message[0]
            : errorResponse.error.message

          if (message == 'Unauthorized') {
            message = 'Por favor, preencha todos os campos.';
          }
    
          this.snackbarService.showErrorMessage(message);
        },
        next: (response: any) => {
          const token = response.access_token;
          const profile_picture_url = response.profile_picture_url;

          this.localStorageService.setToken(token);

          if (profile_picture_url) {
            this.localStorageService.saveProfilePictureUrl(profile_picture_url);
          }

          // this.snackbarService.showSuccessMessage('Logado com sucesso!');
          this.router.navigate(['/feed']);
        }
      });
  }

  googleLogin() {
    this.snackbarService.showErrorMessage('Feature ainda não implementada')
  }
}
