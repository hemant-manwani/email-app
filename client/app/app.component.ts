import { Component, OnInit } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/Rx';


@Component({
  moduleId: module.id,
  selector: 'email-app',
  templateUrl: 'app.component.html',
  styleUrls: [ 'app.component.css' ]
})

export class AppComponent implements OnInit  {
  constructor(private http: Http) { }
  showAddUser: boolean;
  users: Promise<User[]>;
  newUser: User;
  messages: Promise<Message[]>
  currentUser: User;
  selectedUser: string;
  replyMessage: boolean;
  replyMessageId: string;
  composeMessage: boolean;
  ngOnInit(): void{
    this.showAddUser = false;
    this.setHeight();
    this.users = this.getUsers();
    this.newUser = new User();
    this.currentUser = {_id: "",firstName: "",lastName: "",email: "hmanwani@grepruby.com",fromName: "Hemant", toName:"",technology: "", avatar: "",created: {},follow_up_date: {}};
    this.selectedUser = ""
    this.replyMessage = false;
    this.replyMessageId = "";
    this.composeMessage = false;
  }
  setHeight(): void{
    document.getElementById("wrapper").style.minHeight = (window.innerHeight - document.getElementsByTagName("header")[0].offsetHeight - document.getElementsByTagName("footer")[0].offsetHeight)+'px'
  }

  getUsers(): Promise<User[]>{
    return this.http
             .get("http://localhost:5000/users")
             .toPromise()
             .then(response => response.json().data as User[])
             .catch(this.handleError);
  }
  showForm(): void{
    this.showAddUser = true;
  }
  closeModal(): void{
    this.showAddUser = false;
  }
  addUser(): any{
    let data = this.newUser;
    if(data.email == undefined || data.email == null)
      return;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let userData = JSON.stringify(data);
    return this.http
      .post("http://localhost:5000/user", userData, options)
      .toPromise()
      .then(response => response.json().data as User)
      .catch(this.handleError);
  }
  getMessages(email: string):void{
    console.log("hello")
    this.selectedUser = email;
    this.messages = this.requestMessages(email);
  }
  requestMessages(email: string): Promise<Message[]>{

    return this.http
           .get("http://localhost:5000/messages/"+this.currentUser.email+"/"+email)
           .toPromise()
           .then(response => response.json().data as Message[])
           .catch(this.handleError);
  }
  openReply(id: string):void{
    this.replyMessage = true;
    this.replyMessageId = id;
  }
  sendMessage(message: string):any{
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let data = {
      "id": this.replyMessageId,
      "message": message
    };
    let messageData = JSON.stringify(data);
    return this.http
      .put("http://localhost:5000/message", messageData, options)
      .toPromise()
      .then(response => response.json().data as Message)
      .catch(this.handleError);
  }
  closeReplyModal(){
    this.replyMessage = false;
  }
  openComposeModal(){
    this.composeMessage = true;
  }
  closeNewMessageModal(){
    this.composeMessage = false;
  }
  sendNewMessage(subject: string, message: string): any{
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let data = {
      "from": this.currentUser.email,
      "to": this.selectedUser,
      "subject": subject,
      "fromName": this.currentUser.fromName,
      "thread":[
        {
          "item":{
            "body": message,
          }
        }
      ]
    };
    let newMessageData = JSON.stringify(data);
    return this.http
      .post("http://localhost:5000/create_message", newMessageData, options)
      .toPromise()
      .then(response => response.json().data as Message)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

class User{
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  fromName: string;
  toName: string;
  technology: string;
  avatar: string;
  created: {};
  follow_up_date: {};
}
class Message{
  _id: string;
  from: string;
  subject: string;
  thread: Array<{}>;
  to: string;
}
