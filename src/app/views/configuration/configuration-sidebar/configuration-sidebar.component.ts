import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/service/user.service';

@Component({
  selector: 'app-configuration-sidebar',
  templateUrl: './configuration-sidebar.component.html',
  styleUrls: ['./configuration-sidebar.component.css']
})
export class ConfigurationSidebarComponent implements OnInit {

  isCollapsed = false;

  get isAdmin() {
    return this.userService.isAdmin;
  }

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
  }

}
