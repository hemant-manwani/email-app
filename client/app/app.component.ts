import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'email-app',
  templateUrl: 'app.component.html',
  styleUrls: [ 'app.component.css' ]
})
export class AppComponent implements OnInit  {
  ngOnInit() {
    document.getElementById("wrapper").style.minHeight = (window.innerHeight - document.getElementsByTagName("header")[0].offsetHeight - document.getElementsByTagName("footer")[0].offsetHeight)+'px'
  }
}
