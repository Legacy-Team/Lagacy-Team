import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { Post } from '../models/post.model';
import { Comment } from '../models/comment.model';
import { ToastrService } from 'ngx-toastr';
import { CommentService } from '../services/comment.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  picture: any | undefined;
  isOpen: any;
  posts: any;
  comment: Comment;
  post: Post;
  constructor(
    private data: DataService,
    private toastr: ToastrService,
    private userService: UserService,
    private postService: PostService,
    private commentService: CommentService
  ) {
    this.comment = new Comment();
    this.post = new Post();
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe((data: any) => {
      this.posts = data.filter((p: any) => {
        return p.posterId._id === this.user._id;
      });
      this.isOpen = Array(this.posts.length).fill(false);
    });
  }

  openCommentText(index: any) {
    this.isOpen[index] = !this.isOpen[index];
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

  submitUserProfilePicture(event: any) {
    console.log(event.target.files[0]);
    if (event.target.files && event.target.files.length > 0) {
      this.picture = <File>event.target.files[0];
      const myForm = new FormData();
      myForm.append('userId', this.user._id);
      myForm.append('picture', this.picture, this.picture.name);

      this.userService.updateUserPicture(myForm).subscribe((data: any) => {
        if (data.success == true) {
          this.toastr.success('Awesome!', '' + ' Picture updated!', {
            timeOut: 4000,
          });
        } else {
          this.toastr.error('Error -', 'Something went wrong!');
        }
      });
    } else {
      console.log('hello');
    }
  }

  onPictureSelected(event: any) {
    return (this.picture = <File>event.target.files[0]);
  }
  linkImg(fileName: string) {
    // base_URL returns localhost:3000 or the production URL
    return `http://localhost:3001/${fileName}`;
  }
}
