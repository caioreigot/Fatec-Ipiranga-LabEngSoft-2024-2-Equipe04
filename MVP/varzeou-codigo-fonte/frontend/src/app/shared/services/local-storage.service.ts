import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import jwt_decode from 'jwt-decode';
import LoggedUser from '../../models/LoggedUser';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {

  private TOKEN_ID = 'jwt_token';
  private PROFILE_PICTURE_ID = 'profile_picture_url';
  private PROFILE_ROLE_ID = 'profile_role';
  private _loggedInUser: BehaviorSubject<LoggedUser | null> = new BehaviorSubject<LoggedUser | null>(null);

  public get loggedInUser() {
    return this._loggedInUser.value;
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_ID, token);
    this._loggedInUser.next(this.getUserPayload());
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_ID);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_ID);
  }

  getUserPayload(): LoggedUser | null {
    const token = this.getToken();
    if (!token) return null;
    return jwt_decode(token);
  }

  getLoggedUserEmail(): string | null {
    const loggedUser = this.getUserPayload();
    return loggedUser?.email || null
  }

  saveProfilePictureUrl(url: string): void {
    localStorage.setItem(this.PROFILE_PICTURE_ID, url);
  }

  getProfilePictureUrl(): string | null {
    return localStorage.getItem(this.PROFILE_PICTURE_ID);
  }

  clearProfilePictureUrl() {
    localStorage.removeItem(this.PROFILE_PICTURE_ID);
  }
}