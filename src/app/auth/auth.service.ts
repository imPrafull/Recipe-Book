import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';

import { ApiUser, IUserData, User } from './user.model';
import { environment } from '../../environments/environment';

export interface AuthResponseData {
    user:  ApiUser;
    token: string;
}

@Injectable({ providedIn: 'root' })

export class AuthService {

  user = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) { }

  signup(name: string, email: string, password: string) {
    const body = {
      name,
      email,
      password,
    }
    return this.http.post<AuthResponseData>(
      environment.baseUrl + '/users',
      body,
    ).pipe(
      catchError(this.handleError),
      tap(resData => {
        const expiresIn = this.getExpiresIn(resData.token);
        this.handleAuthentication(resData);
      })
    );
  }

  getExpiresIn(token: string): number {
      const decodedToken = jwtDecode(token);
      const expirationDate = new Date(decodedToken.exp! * 1000);
      return expirationDate.getTime() - new Date().getTime();
  }

  autoLogin() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData: IUserData = JSON.parse(userDataString);
    if (!userData) return;

    const loadedUser = new User({
        ...userData,
        tokenExpirationDate: new Date(userData.tokenExpirationDate)
    });

    if (loadedUser.token) {
        this.user.next(loadedUser);
        const expirationDuration = 
            new Date(userData.tokenExpirationDate).getTime() - 
            new Date().getTime();
        this.autoLogout(expirationDuration);
    }
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      environment.baseUrl + '/users/login',
      {
        email: email,
        password: password,
      }
    ).pipe(
      catchError(this.handleError),
      tap(resData => {
        this.handleAuthentication(resData);
      })
    );
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(resData: AuthResponseData) {
    const expiresIn = this.getExpiresIn(resData.token);
    const expirationDate = new Date(new Date().getTime() + expiresIn);
    
    const user = User.fromApiResponse(
        resData.user,
        resData.token,
        expirationDate
    );
    
    this.user.next(user);
    this.autoLogout(expiresIn);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured!';
    if (!errRes.error || !errRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exists!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Invalid Password';
        break;
    }
    return throwError(errorMessage);
  }

}
