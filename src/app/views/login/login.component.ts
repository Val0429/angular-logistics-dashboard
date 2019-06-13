import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ParseService } from 'app/service/parse.service';
import { UserService } from 'app/service/user.service';
import { ConfigService } from 'app/service/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  options: Select2Options = {};

  model: {
    host?: string,
    port?: number,
    email?: string,
    password?: string,
    rememberMe?: boolean
  } = {
      // host: '172.16.10.182',
      // port: 1337,
      // email: 'admin@admin.com',
      // password: 'admin',
      // rememberMe: true
    };

  constructor(
    private router: Router,
    private userService: UserService,
    private parseService: ParseService,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    const lang = localStorage.getItem('lang') || 'zh_TW';
    this.options = {
      data: [
        { id: 'zh_TW', text: '繁體中文', selected: lang === 'zh_TW' },
        { id: 'zh_CN', text: '簡體中文', selected: lang === 'zh_CN' },
        { id: 'en_US', text: 'English', selected: lang === 'en_US' },
      ]
    };
  }

  fixPort() {
    if (this.model.port < 1) {
      this.model.port = 1;
      return;
    }

    if (this.model.port > 65535) {
      this.model.port = 65535;
      return;
    }
  }

  login() {

    if (this.model.email && this.model.email.length > 128) {
      this.model.email = this.model.email.substr(0, 128);
    }

    if (this.model.password && this.model.password.length > 128) {
      this.model.password = this.model.password.substr(0, 128);
    }

    this.parseService.host = this.model.host || 'localhost';
    this.parseService.port = this.model.port || 1337;

    this.userService.storage['host'] = this.model.host || 'localhost';
    this.userService.storage['port'] = this.model.port || 1337;
    this.userService.storage['rememberMe'] = this.model.rememberMe || false;
    this.userService.saveStorage();

    this.parseService.initParseServer()
      .switchMap(result => this.userService.logInByEmail({
        email: this.model.email,
        password: this.model.password
      })).do(result => {
        if (!result) {
          return;
        }
        this.router.navigateByUrl('/');
      })
      .toPromise()
      .catch(error => alert(error));
  }

  changeLang(data: { type: string, event: any }) {
    if (data.type !== 'select2:select') {
      return;
    }
    this.configService.currentLang = data.event.params.data.id;
    localStorage.setItem('lang', this.configService.currentLang);
    location.reload();
  }
}
