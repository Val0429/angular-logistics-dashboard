import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from 'app/service/i18n.service';
import { UserService } from 'app/service/user.service';
import { IPageViewerOptions } from 'app/shared/components/page-viewer/page-viewer.component';
import { Select2EventType } from 'app/shared/directives/select2.directive';
import { RoleType } from 'isap-logistics-solution-lib';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  isAgent = false;

  users: Parse.User[] = [];

  inRoleUsers: Parse.User[] = [];

  currentEditUser: any;

  // roles: { role: Parse.Role, users: Parse.User[] }[] = [];

  pageViewerOptions: IPageViewerOptions;

  queryParams: {
    page?: number;
    email?: string,
    nickname?: string,
    // email?: string
  } = {
      email: '',
      nickname: '',
      // email: ''
    };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    private userService: UserService,
    private i18nService: I18nService
  ) { }

  ngOnInit() {
    this.fetchRouteQueryParams()
      .switchMap(() => this.fetchUsersByRoleName([RoleType.ADMINISTRATOR, RoleType.AGENT]))
      .switchMap(() => this.initUsers())
      .subscribe();
  }

  fetchRouteQueryParams() {
    const queryParams$ = this.activatedRoute.queryParams
      .do(queryParams => {
        Object.assign(this.queryParams, queryParams);
        ['page'].forEach(key => this.queryParams[key] = +this.queryParams[key] || 0);
      });
    return queryParams$;
  }

  /** 取得指定 Roles 內的所有 User */
  fetchUsersByRoleName(roleNames: string[]) {
    const users: Parse.User[] = [];
    if (!Array.isArray(roleNames)) {
      return Observable.of(users);
    }

    const fetch$ = Observable.fromPromise(
      this.userService.fetchRoles(query => {
        query.containedIn('name', roleNames);
      }))
      .concatMap(roles => {
        if (roles.length < 1) {
          return Observable.of(users);
        }

        const fetchUsers$ = Observable.from(roles)
          .mergeMap(role => role.getUsers().query().find())
          .toArray()
          .distinct()
          .map(userArray => userArray.reduce((a, b) => a.concat(b)))
          .map(inRoleUsers => this.inRoleUsers = inRoleUsers);

        return fetchUsers$;
      });
    return fetch$;
  }

  /** 初始化 User */
  initUsers() {
    const options: IPageViewerOptions = {
      currentPage: this.queryParams.page || 1,
      pageVisibleSize: 10,
      itemVisibleSize: 10,
      itemCount: 0
    };

    // 查詢條件
    const filter = (query: Parse.Query<Parse.User>) => {
      if (this.queryParams.email) {
        query.contains('email', this.queryParams.email);
      }

      if (this.queryParams.nickname) {
        query.contains('nickname', this.queryParams.nickname);
      }

      if (this.isAgent) {
        query.containedIn('objectId', this.inRoleUsers.map(user => user.id));
      } else {
        query.notContainedIn('objectId', this.inRoleUsers.map(user => user.id));
      }

      query.descending('createdAt');
    };

    // 取得總筆數
    const getCount$ = Observable.fromPromise(this.userService.countUsers(filter))
      .map(pageCount => {
        options.itemCount = pageCount;
        this.pageViewerOptions = options;
      });

    // 分頁查詢
    const fetchUsers$ = Observable.fromPromise(this.userService.fetchUsersPaging({
      currentPage: options.currentPage,
      itemVisibleSize: options.itemVisibleSize,
      filter: filter
    }))
      .map(users => this.users = users);

    // 合併執行
    const all$ = getCount$.switchMap(() => fetchUsers$);
    return all$;
  }

  pageChange(pageNumber?: number) {
    const queryParams = Object.assign({}, this.queryParams);
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
        delete queryParams[key];
      }
    });
    queryParams.page = pageNumber || 1;
    this.router.navigate(['/configuration', 'user'], { queryParams: queryParams });
  }

  clearSearch() {
    Object.keys(this.queryParams)
      .forEach(key => delete this.queryParams[key]);
    this.pageChange();
  }

  removeMember(event: Event, user: Parse.User) {
    event.stopPropagation();
    if (!user || !confirm(this.i18nService.transform('ALERT_REMOVE_USER_CONFIRM'))) {
      return;
    }

    Observable.fromPromise(user.destroy({ useMasterKey: true }))
      .concatMap(_user => {
        if (this.isAgent && this.inRoleUsers.some(roleUser => roleUser.id === _user.id)) {
          return Observable.fromPromise(this.userService.getRole(query => query.equalTo('name', RoleType.AGENT)))
            .concatMap(role => {
              role.getUsers().remove(_user);
              return role.save();
            })
            .map(() => {
              const index = this.inRoleUsers.findIndex(roleUser => roleUser.id === _user.id);
              this.inRoleUsers.splice(index, 1);
              return {};
            });
        }
        return Observable.of({});
      })
      .concatMap(() => this.initUsers())
      .toPromise()
      .then(() => alert(this.i18nService.transform('ALERT_SUCCESSFULLY_SAVED')))
      .catch(error => alert(error));
  }

  saveEditUser() {

    if (!this.currentEditUser) {
      return;
    }

    let user: Parse.User;
    if (!this.currentEditUser.objectId) {
      user = new Parse.User();
    } else {
      user = this.users.find(_user => _user.id === this.currentEditUser.objectId) || new Parse.User();
    }

    user.setUsername(this.currentEditUser.email);
    user.setEmail(this.currentEditUser.email);

    if (this.currentEditUser.password) {
      user.setPassword(this.currentEditUser.password);
    }
    user.set('nickname', this.currentEditUser.nickname);

    Observable.fromPromise(user.save(null, { useMasterKey: true }))
      .concatMap(_user => {
        if (this.isAgent && !this.inRoleUsers.some(inRoleUser => inRoleUser.id === _user.id)) {
          return Observable.fromPromise(this.userService.getRole(query => query.equalTo('name', RoleType.AGENT)))
            .concatMap(role => {
              role.getUsers().add(_user);
              return role.save();
            })
            .map(() => {
              this.inRoleUsers.push(_user);
              return {};
            });
        }
        return Observable.of({});
      })
      .switchMap(() => this.initUsers())
      .toPromise()
      .then(() => alert(this.i18nService.transform('ALERT_SUCCESSFULLY_SAVED')))
      .catch(error => alert(error));
  }

  convertToEditUser(user?: Parse.User) {
    user = user || new Parse.User();
    this.currentEditUser = user.toJSON();
  }
}
