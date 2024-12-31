import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { SessionStorage } from 'ngx-webstorage';
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  @SessionStorage('auth.user')
  public currentUser: any;

  @SessionStorage('auth.token')
  public token: any;

  constructor(protected httpClient : HttpClientService) {

  }

  // private apiUrl = 'http://localhost:3000/auth';

  login(credentials: { username: string; password: string }): Observable<any> {
      return this.httpClient.post(`/auth/login`, credentials);
  }
}
