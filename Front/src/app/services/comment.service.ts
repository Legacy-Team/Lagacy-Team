import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  readonly rootUrl = 'http://localhost:3001/api';
  comment: any;
  authToken: any;
  idpost: any;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {
    this.loadToken();
  }
  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  addcomment(comment: any, postId: String) {
    console.log('this is the comment', comment, postId);
    let headers = new HttpHeaders({
      Authorization: this.authToken,
    });
    return this.http.patch(
      this.rootUrl + '/post/comment-post/' + postId,
      { comment, postId },
      {
        headers: headers,
      }
    );
  }
  deleteComment(postId: String, commentId: String) {
    return this.http.delete(
      `${this.rootUrl}/post/delete-comment-post/${postId}/${commentId}`
    );
  }
  //delete a comment
}
