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

  ngOnInit(): void{
    this.showAddUser = false;
    this.setHeight();
    this.users = this.getUsers();
    this.newUser = new User();
    this.currentUser = {"fromName":"Hemant","email": "hemantmanwani.iitr@gmail.com"};
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
             .get("http://localhost:3000/users")
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
  addUser(): void{
    let data = this.newUser;
    if(data.email == undefined || data.email == null)
      return;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    data = JSON.stringify(data);
    return this.http
      .post("http://localhost:3000/user", data, options)
      .subscribe((res)=>{console.log(res)},(err)=>{console.log(err)})
  }
  getMessages(email: string):void{
    console.log("hello")
    this.selectedUser = email;
    this.messages = this.requestMessages(email);
  }
  requestMessages(email: string): Promise<Message[]>{

    return this.http
           .get("http://localhost:3000/messages/"+this.currentUser.email+"/"+email)
           .toPromise()
           .then(response => response.json().data as Message[])
           .catch(this.handleError);
  }
  openReply(id: string):void{
    this.replyMessage = true;
    this.replyMessageId = id;
  }
  sendMessage(message: string):void{
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let data = {
      "id": this.replyMessageId,
      "message": message
    };
    data = JSON.stringify(data);
    return this.http
      .put("http://localhost:3000/message", data, options)
      .subscribe((res)=>{console.log(res)},(err)=>{console.log(err)})
      .share();
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
  sendNewMessage(subject: string, message: string): void{
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
    data = JSON.stringify(data);
    return this.http
      .post("http://localhost:3000/create_message", data, options)
      .subscribe((res)=>{console.log(res)},(err)=>{console.log(err)})
      .share();
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

class User{
  _id: string,
  firstName: string,
  lastName: string,
  email: string,
  technology: string,
  avatar: string,
  created: object,
  follow_up_date: object
}
class Message{
  _id: string,
  from: string,
  subject: string,
  thread: Array,
  to: string
}
