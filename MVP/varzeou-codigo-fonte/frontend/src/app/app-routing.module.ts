import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { FeedComponent } from './features/feed/feed.component';
import { ConfirmAccountComponent } from './features/confirm-account/confirm-account.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ChatComponent } from './features/chat/chat.component';
import { ChatsComponent } from './features/chats/chats.component';

const routes: Routes = [
  { 
    path: '',
    component: LoginComponent
  },
  { 
    path: 'login',
    component: LoginComponent
  },
  { 
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'confirm-account/:id',
    component: ConfirmAccountComponent
  },
  { 
    path: 'feed',
    component: FeedComponent
  },
  { 
    path: 'search',
    component: FeedComponent
  },
  {
    path: 'profile/:userid',
    component: ProfileComponent
  },
  { 
    path: 'chat/:userid',
    component: ChatComponent
  },
  { 
    path: 'chats',
    component: ChatsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
