import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { ChatService } from '../services/chat.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-display-message',
  templateUrl: './display-message.component.html',
  styleUrls: ['./display-message.component.scss'],
})
export class DisplayMessageComponent implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  @Input() currentFriend: User | any;
  message: string = '';
  diplayedMessages: [] | undefined;
  currentRoom: any | undefined;
  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnChanges() {
    this.getCurrentRoom((data: any) => {
      this.currentRoom = data;
    });
  }
  ngOnInit(): void {
    console.log('starting display messages');
    this.getCurrentRoom((data: any) => {
      this.currentRoom = data;
      console.log(this.currentRoom);
    });
    this.chatService.messages.subscribe((msg) => {
      console.log(
        'this has the new message',
        msg.text.messages[msg.text.messages.length - 1]
      );
      this.currentRoom.messages.push(
        msg.text.messages[msg.text.messages.length - 1]
      );
    });
  }

  getCurrentRoom(callback: Function) {
    console.log('starting getCurrentRoom');
    this.user.rooms.map((r: any) => {
      if (
        r.user_id1 === this.currentFriend._id ||
        r.user_id2 === this.currentFriend._id
      ) {
        console.log('found a room !', r._id);
        this.userService.getroom(r._id).subscribe((data: any) => {
          callback(data);
        });
      }
    });
  }

  sendMessage() {
    // push the message to the server via socket.io
    // we need to tweak the polling to get messages from DB
    let newMsg = new Message();
    newMsg.message = this.message;
    newMsg.receiverId = this.currentFriend._id;
    newMsg.senderId = this.user._id;
    newMsg.roomId = this.currentRoom._id;
    console.log(newMsg);
    this.chatService.sendMsg(newMsg);
    this.message = '';
    this.getCurrentRoom((data: any) => {
      this.currentRoom = data;
      console.log(this.currentRoom);
    });
  }
}
