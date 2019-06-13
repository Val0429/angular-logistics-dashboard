import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UserService } from 'app/service/user.service';
import { Router } from '@angular/router';
import { I18nService } from 'app/service/i18n.service';

@Component({
  selector: 'app-isap-header',
  templateUrl: './isap-header.component.html',
  styleUrls: ['./isap-header.component.css']
})
export class ISapHeaderComponent implements OnInit {

  @Output() notifySidebarStatus = new EventEmitter();

  get username() {
    if (!this.userService.currentUser) {
      return '';
    }
    return this.userService.currentUser.get('nickname') || '';
  }

  get isAdmin() {
    return this.userService.isAdmin;
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private i18nService: I18nService
  ) { }

  ngOnInit() {
  }

  logOut() {
    if (!confirm(this.i18nService.transform('ALERT_LOGOUT_CONFIRM'))) {
      return;
    }

    this.userService.logOut()
      .then(() => this.router.navigateByUrl('/login'));
  }

}
