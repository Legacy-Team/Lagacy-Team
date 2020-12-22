import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss'],
})
export class UpdateProfileComponent implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  picture: any | undefined;
  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
  }

  linkImg(fileName: string) {
    return `http://localhost:3001/${fileName}`;
  }

  onPictureSelected(event: any) {
    return (this.picture = <File>event.target.files[0]);
  }

  OnSubmit(form: NgForm) {
    const myForm = new FormData();
    console.log(this.user);
    myForm.append('userId', this.user._id);
    myForm.append('bio', this.user.bio);
    myForm.append('username', this.user.username);
    myForm.append('picture', this.picture, this.picture.name);
    console.log(myForm);
    this.userService.updateUser(myForm).subscribe((data: any) => {
      console.log(data);
      if (data.success == true) {
        this.toastr.success('Awesome!', 'Your profile has been updated', {
          timeOut: 4000,
        });
      } else {
        this.toastr.error('Error -', data.errors);
      }
    });
  }
}
