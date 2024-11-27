import { HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { isDevMode, Injectable } from '@angular/core';

@Injectable()
export class BaseUrlHttpInterceptor implements HttpInterceptor {

  backendBaseUrl = isDevMode() ? 'http://192.168.0.64:3000' : '';

  constructor(private localStorageService: LocalStorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const token = this.localStorageService.getToken() ?? '';

    /* Injetando o token nos headers */
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const apiRequest = request.clone({
      url: `${this.backendBaseUrl}/${request.url}`,
      headers
    });

    return next.handle(apiRequest);
  }
}