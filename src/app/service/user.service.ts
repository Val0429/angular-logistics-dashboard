import { Injectable } from '@angular/core';
import { ParseService } from 'app/service/parse.service';
import { RoleType } from 'isap-logistics-solution-lib';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserService {

  /** 當前使用者 */
  currentUser: Parse.User;

  /** 使用者資訊 */
  storage: { [key: string]: any } = {};

  isAdmin = false;

  constructor(
    private parseService: ParseService
  ) {
    if (sessionStorage.hasOwnProperty('USER_INFO')) {
      this.storage = JSON.parse(sessionStorage.getItem('USER_INFO'));
    } else if (localStorage.hasOwnProperty('USER_INFO')) {
      this.storage = JSON.parse(localStorage.getItem('USER_INFO'));
    }
  }

  saveStorage() {
    if (this.storage['rememberMe']) {
      localStorage.setItem('USER_INFO', JSON.stringify(this.storage));
      return;
    }
    sessionStorage.setItem('USER_INFO', JSON.stringify(this.storage));
  }

  checkUserPermission(user?: Parse.User) {
    if (!user) {
      this.isAdmin = false;
      return Observable.of(false);
    }

    const checkUserPermission$ = Observable.fromPromise(this.getRole(query => query.equalTo('name', RoleType.ADMINISTRATOR)))
      .concatMap(role => {
        const query = role.getUsers().query();
        query.equalTo('objectId', user.id);
        return query.first();
      })
      .map(_user => this.isAdmin = !!_user);
    return checkUserPermission$;
  }

  /** 登入 Parse Server */
  logIn(args: {
    username: string,
    password: string
  }) {
    const login$ = Observable.fromPromise(Parse.User.logIn(args.username, args.password))
      .concatMap(user => this.checkUserPermission(user))
      .map(() => {
        const user = Parse.User.current();
        if (!user) {
          return false;
        }
        this.storage['sessionToken'] = user.getSessionToken();
        this.currentUser = user;
        if (this.storage['rememberMe']) {
          localStorage.setItem('USER_INFO', JSON.stringify(this.storage));
        } else {
          sessionStorage.setItem('USER_INFO', JSON.stringify(this.storage));
        }
        return true;
      })
      .toPromise();
    return login$;
  }

  logInByEmail(args: {
    email: string,
    password: string
  }) {
    const login$ = Observable.fromPromise(this.getUser(query => query.equalTo('email', args.email)))
      .concatMap(user => {
        if (!user) {
          throw new Error('Invalid email.');
        }
        return this.logIn({
          username: user.getUsername(),
          password: args.password
        });
      })
      .toPromise();
    return login$;
  }

  logOut() {
    this.storage = {};
    this.currentUser = undefined;
    if (this.storage['rememberMe']) {
      localStorage.removeItem('USER_INFO');
    } else {
      sessionStorage.removeItem('USER_INFO');
    }
    return Parse.User.logOut();
  }

  /** 新增 Parse Server User */
  signUp(args: {
    username: string,
    password: string,
    nickname: string
  }) {
    const user = new Parse.User();
    user.set('username', args.username);
    user.set('password', args.password);
    user.set('nickname', args.nickname);
    return Observable.fromPromise(user.signUp(null)).toPromise();
  }

  checkLogInStatus(): Promise<boolean> {

    const sessionToken = this.storage['sessionToken'];
    if (!sessionToken) {
      return Observable.of(false).toPromise();
    }

    // Parse Server 初始化
    this.parseService.host = this.storage['host'] || 'localhost';
    this.parseService.port = this.storage['port'] || 1337;
    const check$ = this.parseService.initParseServer()
      .concatMap(() => Parse.User.become(sessionToken))
      .map(user => this.currentUser = user)
      .concatMap(user => this.checkUserPermission(this.currentUser))
      .map(() => !!this.currentUser)
      .toPromise();

    return check$;
  }

  fetchUsers(filter?: (query: Parse.Query<Parse.User>) => void): Parse.Promise<Parse.User[]> {
    const query = new Parse.Query(Parse.User);
    if (filter) {
      filter(query);
    }
    return query.find({ useMasterKey: true });
  }

  fetchUsersPaging(args: {
    currentPage: number,
    itemVisibleSize: number,
    filter?: (query: Parse.Query<Parse.User>) => void
  }): Parse.Promise<Parse.User[]> {
    const users = this.fetchUsers(query => {
      query.limit(args.itemVisibleSize);
      query.skip((args.currentPage - 1) * args.itemVisibleSize);
      if (args.filter) {
        args.filter(query);
      }
    });
    return users;
  }

  countUsers(filter?: (query: Parse.Query<Parse.User>) => void): Parse.Promise<number> {
    const query = new Parse.Query(Parse.User);
    if (filter) {
      filter(query);
    }
    return query.count();
  }

  getUser(filter?: (query: Parse.Query<Parse.User>) => void): Parse.Promise<Parse.User> {
    const query = new Parse.Query(Parse.User);
    if (filter) {
      filter(query);
    }
    return query.first();
  }

  fetchRoles(filter?: (query: Parse.Query<Parse.Role>) => void) {
    const query = new Parse.Query(Parse.Role);
    if (filter) {
      filter(query);
    }
    query.include('users');
    return query.find();
  }

  getRole(filter?: (query: Parse.Query<Parse.Role>) => void) {
    const query = new Parse.Query(Parse.Role);
    if (filter) {
      filter(query);
    }
    return query.first();
  }
}
