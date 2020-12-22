import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private friendsSource = new BehaviorSubject(new Array());
  currentfriends = this.friendsSource.asObservable();

  private currentuserSource = new BehaviorSubject(new Object());
  currentuser = this.currentuserSource.asObservable();

  constructor() {}

  changeuser(user: any) {
    this.currentuserSource.next(user);
  }
  changefriends(friends: any) {
    this.friendsSource.next(friends);
  }

  
}
