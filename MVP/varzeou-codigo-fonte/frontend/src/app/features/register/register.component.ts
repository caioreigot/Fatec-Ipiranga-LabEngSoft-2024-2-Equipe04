import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { BackendService } from 'src/app/shared/services/backend.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

interface PasswordState {
  element: HTMLInputElement,
  state: 'hidden' | 'visible'
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  
  creatingUser: boolean = false;

  passwordState1: 'hidden' | 'visible' = 'hidden'
  passwordState2: 'hidden' | 'visible' = 'hidden'

  constructor(
    private backendService: BackendService,
    private snackbarService: SnackbarService,
  ) {}

  onPasswordVisibilityClick(n: number) {
    if (n == 1) {
      if (this.passwordState1 == 'hidden') this.passwordState1 = 'visible'
      else if (this.passwordState1 == 'visible') this.passwordState1 = 'hidden'
    } else if (n == 2) {
      if (this.passwordState2 == 'hidden') this.passwordState2 = 'visible'
      else if (this.passwordState2 == 'visible') this.passwordState2 = 'hidden'
    }
  }

  isEmpty(str: string | string[]) {
    // See if str is type string or array
    if (typeof str == 'string') {
      return str.trim().length == 0
    } else if (Array.isArray(str)) {
      for (let s of str) {
        if (s.trim().length == 0) return true
      }
    }

    return null
  }

  onConfirm(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    if (this.isEmpty([firstName, lastName, email, password, confirmPassword])) {
      this.snackbarService.showErrorMessage('Por favor, preencha todos os campos')
      return;
    }

    if (confirmPassword != password) {
      this.snackbarService.showErrorMessage('As senhas não batem')
      return;
    }

    this.creatingUser = true;

    this.backendService.createUser(firstName, lastName, email, password)
      .pipe(
        finalize(() => {
          this.creatingUser = false;
        })
      )
      .subscribe({
        next: () => {
          alert('Quase lá! Verifique seu e-mail para concluir o cadastro com sucesso')
        },
        error: (errorResponse) => {
          const message = errorResponse.error.message instanceof Array 
            ? errorResponse.error.message[0]
            : errorResponse.error.message
  
          this.snackbarService.showErrorMessage(message);
        }
      });
  }
}
