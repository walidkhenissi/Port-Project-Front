// auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedIn = false;
  private redirectUrl: string;

  constructor(private router: Router, private jwtHelper: JwtHelperService) { }

  isAuthenticated(): boolean {
    try {
      const isTokenExpired = this.jwtHelper.isTokenExpired(localStorage.getItem('token'));
      if (isTokenExpired) {
        console.log('Token has expired');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }
}

