import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { User } from '../models/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';
const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly rootUrl = 'http://localhost:3001/api';

  authToken: any;
  user: any;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(private http: HttpClient) {}

  userAuthentification(email: any, password: any) {
    var data = {
      email: email,
      password: password,
    };
    var requestHeader = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post(this.rootUrl + '/user/login', data, this.httpOptions);
  }

  registerUser(user: User) {
    const body: User = {
      username: user.username,
      email: user.email,
      password: user.password,
      friends: user.friends,
      invitations: user.invitations,
      bio: user.bio,
      stars: user.stars,
    };
    return this.http.post(
      this.rootUrl + '/user/register',
      body,
      this.httpOptions
    );
  }

  getFriendsOfFriends(id: String, userid: String) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      this.rootUrl + '/user/friendsOfFriends',
      { id, userid },
      {
        headers: headers,
      }
    );
  }

  getProfile() {
    this.loadToken();
    let headers = new HttpHeaders({
      Authorization: this.authToken,
      'Content-Type': 'application/json',
    });
    return this.http.get(this.rootUrl + '/profile', { headers: headers });
  }
  getroom(id: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(
      this.rootUrl + '/user/room',
      { id },
      { headers: headers }
    );
  }
  sendInvitation(userId: String, friendId: String) {
    console.log(friendId);

    return this.http.post(
      `${this.rootUrl}/user/invite/${userId}/${friendId}`,
      {}
    );
  }
  acceptInvitation(userId: String, friendId: String) {
    console.log(friendId);

    return this.http.post(
      `${this.rootUrl}/user/accept/${userId}/${friendId}`,
      {}
    );
  }
  storeUserData(token: string, user: any) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  Logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    let token = localStorage.getItem('id_token') || undefined;
    return !helper.isTokenExpired(token);
  }

  updateUserPicture(form: any) {
    let headers = new HttpHeaders({
      Authorization: this.authToken,
    });
    console.log('form', form);
    return this.http.put(this.rootUrl + '/user/profile-picture', form, {
      headers: headers,
    });
  }

  updateUser(form: any) {
    return this.http.post(this.rootUrl + '/user/update', form);
  }
}
