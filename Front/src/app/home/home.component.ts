import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from '../services/data.service';
import { PostService } from '../services/post.service';
import { UserService } from '../services/user.service';
import { CommentService } from '../services/comment.service';
import { ToastrService } from 'ngx-toastr';
import { Post } from '../models/post.model';
import { Comment } from '../models/comment.model';
import { Router } from '@angular/router';
import { ConditionalExpr } from '@angular/compiler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  posts: any;
  friendsOfFriends = new Array();
  isOpen: any;
  post: Post;
  comment: Comment;
  picture: any | undefined;
  idpost: any | undefined;
  constructor(
    private data: DataService,
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.post = new Post();
    this.comment = new Comment();
  }

  openCommentText(index: any) {
    this.isOpen[index] = !this.isOpen[index];
  }

  ngOnInit(): void {
    this.resetForm();
    this.loadPosts();
    this.newuser();
    this.newfriends();
    this.suggestions((data: any) => {
      this.friendsOfFriends.push(data);
    });

    console.log('test', this.friendsOfFriends);
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe((data) => {
      this.posts = data;
      this.isOpen = Array(this.posts.length).fill(false);
      console.log('hello i m home', this.posts);
    });
  }
  invite(friendId: String) {
    this.userService
      .sendInvitation(this.user._id, friendId)
      .subscribe((data) => {
        console.log(data);
      });
  }

  isFriend(friend: any) {
    let isFriend = false;
    this.user.friends.map((myFriend: any) => {
      if (myFriend._id === friend) isFriend = true;
    });
    return isFriend;
  }

  suggestions(callback: Function) {
    var usernames = new Array();
    console.log(this.user);
    for (var i = 0; i < this.user.friends.length; i++) {
      usernames.push(this.user.friends[i].username);
    }
    for (var i = 0; i < this.user.friends.length; i++) {
      console.log(this.user.friends[i].friends.length);
      for (var j = 0; j < this.user.friends[i].friends.length; j++) {
        this.userService
          .getFriendsOfFriends(this.user.friends[i].friends[j], this.user._id)
          .subscribe((data: any) => {
            if (
              usernames.includes(data.username) ||
              data.username === this.user.username
            ) {
            } else {
              usernames.push(data.username);
              console.log('data', data);
              callback(data);
            }
          });
      }
    }
  }
  newuser() {
    this.data.changeuser(this.user);
  }
  newfriends() {
    this.data.changefriends(this.user.friends);
  }
  OnSubmitPost(form: NgForm) {
    const myForm = new FormData();
    myForm.append('posterId', this.user._id);
    myForm.append('message', form.value.message);
    myForm.append('picture', this.picture, this.picture.name);

    this.postService.addPost(myForm).subscribe((data: any) => {
      if (data.success == true) {
        this.resetForm(form);
        this.toastr.success('Awesome!', data.msg + ' Verify Your Account', {
          timeOut: 4000,
        });
        this.loadPosts();
      } else {
        this.toastr.error('Error -', data.msg);
      }
    });
  }
  OnSubmitcomment(form: NgForm, postId: String) {
    this.comment.commenterId = this.user._id;
    this.comment.commenterUsername = this.user.username;
    this.comment.text = form.value.text;
    this.commentService
      .addcomment(this.comment, postId)
      .subscribe((data: any) => {
        if (data) {
          this.resetForm(form);
          this.toastr.success('Awesome!', data.msg + ' Verify Your Account', {
            timeOut: 4000,
          });
          this.loadPosts();
        } else {
          this.toastr.error('Error -', data.msg);
        }
      });
  }

  resetForm(form?: NgForm) {
    if (form != null) form.reset();
    this.post = {
      posterId: '',
      message: '',
      picture: '',
      video: '',
      likers: ['string'],
      comments: [{}],
    };
  }
  clicklike(postId: any) {
    this.postService.likePost(postId, this.user._id);
    // this.postService.getAllPosts().subscribe((data) => {
    //   this.posts = data;
    //   this.isOpen = Array(this.posts.length).fill(false);
    //   // console.log('hello i m home', this.posts);
    // });
  }

  onPictureSelected(event: any) {
    return (this.picture = <File>event.target.files[0]);
  }

  linkImg(fileName: string) {
    // base_URL returns localhost:3000 or the production URL
    return `http://localhost:3001/${fileName}`;
  }
  //methode delete
  deleteComment(postId: any, commentId: any) {
    this.commentService.deleteComment(postId, commentId).subscribe(() => {
      console.log('deleting');
      // this.post.comments = this.post.comments.filter(comment => {
      //   return comment._id != commentId
      // })
    });
  }
}
