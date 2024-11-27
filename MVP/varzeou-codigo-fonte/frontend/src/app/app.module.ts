import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BaseUrlHttpInterceptor } from './core/interceptors/base-url-http-interceptor';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/login/login.component';
import { CoreModule } from './core/core.module';
import { RegisterComponent } from './features/register/register.component';
import { FeedComponent } from './features/feed/feed.component';
import { ConfirmAccountComponent } from './features/confirm-account/confirm-account.component';
import { ChatComponent } from './features/chat/chat.component';
import { ProfileComponent } from './features/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatsComponent } from './features/chats/chats.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    FeedComponent,
    ConfirmAccountComponent,
    ChatComponent,
    ProfileComponent,
    ChatsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: BaseUrlHttpInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {}
