import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  readonly rootUrl = 'http://localhost:3001/api';
  post: any;
  authToken: any;
  idpost: any;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  getAllPosts() {
    var requestHeader = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get(this.rootUrl + '/post', requestHeader);
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  addPost(post: any) {
    let headers = new HttpHeaders({
      Authorization: this.authToken,
    });
    return this.http.post(this.rootUrl + '/post/create', post, {
      headers: headers,
    });
  }
  likePost(postId: any, id: any) {
    console.log('anything');
    var requestHeader = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post(
      this.rootUrl + `/post/like-post/${postId}`,
      { id },
      requestHeader
    );
  }
}
