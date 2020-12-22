import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  picture: any | undefined;

  constructor(
    private data: DataService,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
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
