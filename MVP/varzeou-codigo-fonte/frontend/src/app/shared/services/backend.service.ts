import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, publish } from 'rxjs';
import { Post } from 'src/app/models/Post';

@Injectable({ providedIn: 'root' })
export class BackendService {

  noInterceptHttp: HttpClient;

  public endpoints = {
    user: {
      login: 'user/login',
      create: 'user/create',
      confirmAccount: 'user/confirm-account',
      getProfile: 'user/get-profile/:userid',
      getProfilePicture: 'user/get-profile-pic',
      uploadProfilePicture: 'user/upload-profile-pic',
      updateSoccerRole: 'user/set-soccer-role',
      getSoccerRole: 'user/get-soccer-role',
      toggleFollow: 'user/toggle-follow/:userid',
      getUser: 'user/:userid',
      sendMessage: 'user/send-message',
      getChats: 'user/get-chats',
      getChatMessages: 'user/get-chat-messages/:userid',
    },
    post: {
      getAll: 'post/all',
      getMyPosts: 'post/my-posts',
      publish: 'post/publish',
      delete: 'post/:id',
      like: 'post/like',
      unlike: 'post/unlike',
      getFollowingPosts: 'post/following/posts',
      comment: 'post/comment',
      getComments: 'post/comment/:postid',
    }
  }

  constructor(private http: HttpClient, private handler: HttpBackend) {
    this.noInterceptHttp = new HttpClient(handler);
  }

  createUser(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
  ): Observable<any> {
    const body = {
      first_name: firstname,
      last_name: lastname,
      email: email,
      password: password,
    }
    
    return this.http.post(this.endpoints.user.create, body);
  }

  confirmAccount(roomId: string): Observable<any> {
    return this.http.post(this.endpoints.user.confirmAccount, { room_id: roomId });
  }

  login(email: string, password: string): Observable<any> {
    const body = { email, password }
    return this.http.post(this.endpoints.user.login, body);
  }

  getProfile(userid: string): Observable<any> {
    return this.http.get(this.endpoints.user.getProfile.replace(':userid', userid));
  }

  getProfilePicture(): Observable<any> {
    return this.http.get(this.endpoints.user.getProfilePicture);
  }

  uploadProfilePicture(formData: FormData): Observable<any> {
    return this.http.post(this.endpoints.user.uploadProfilePicture, formData);
  }

  updateSoccerRole(role: string): Observable<any> {
    return this.http.post(this.endpoints.user.updateSoccerRole, { role });
  }

  getSoccerRole(): Observable<{ role: string }> {
    return this.http.get<{ role: string }>(this.endpoints.user.getSoccerRole);
  }

  getPosts() {
    return this.http.get<Post[]>(this.endpoints.post.getAll);
  }

  getMyPosts() {
    return this.http.get<Post[]>(this.endpoints.post.getMyPosts);
  }

  getFollowingPosts() {
    return this.http.get<Post[]>(this.endpoints.post.getFollowingPosts);
  }

  publishPost(textToPublish: string, file?: File) {
    const formData = new FormData();
    formData.append('text', textToPublish);
    
    if (file) {
      formData.append('file', file);
    }
  
    return this.http.post<{ text: string, imageURL: string | null }>(this.endpoints.post.publish, formData);
  }

  deletePost(postId: string) {
    return this.http.delete(this.endpoints.post.delete.replace(':id', postId))
  }

  async tokenStillValid(callback: (arg0: boolean) => void) {
    this.http.get(this.endpoints.user.login).subscribe({
      error: () => callback(false),
      next: () => callback(true)
    });
  }

  likePost(postId: string, reaction: string) {
    const body = { postId, reaction }
    return this.http.post<void>(this.endpoints.post.like, body)
  }

  unlikePost(postId: string) {
    const body = { postId }
    return this.http.post<void>(this.endpoints.post.unlike, body)
  }

  toggleFollow(userId: string) {
    return this.http.get(this.endpoints.user.toggleFollow.replace(':userid', userId));
  }

  getChats() {
    return this.http.get(this.endpoints.user.getChats);
  }

  getChatMessages(userToGetMessagesId: string) {
    return this.http.get(this.endpoints.user.getChatMessages.replace(':userid', userToGetMessagesId));
  }

  sendMessage(text: string, toUserId: string) {
    const body = { text: text, to: toUserId };
    return this.http.post<void>(this.endpoints.user.sendMessage, body);
  }

  comment(text: string, postId: string) {
    const body = { text, postId };
    return this.http.post(this.endpoints.post.comment, body);
  }

  getComments(postId: string) {
    return this.http.get(this.endpoints.post.getComments.replace(':postid', postId));
  }

  getUser(userId: string) {
    return this.http.get(this.endpoints.user.getUser.replace(':userid', userId));
  }
}