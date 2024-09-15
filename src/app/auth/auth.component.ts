import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AuthService, AuthResponseData } from './auth.service';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';
import { LoaderService } from '../shared/loading-spinner/loader.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnDestroy {

  isLoginMode = true;
  error: string;
  user = {
    email: '',
    password: ''
  };
  @ViewChild(PlaceholderDirective, {static: false}) alertHost: PlaceholderDirective;

  private closeSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService,
    private toast: ToastService,
  ) { }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    let authObs: Observable<AuthResponseData>;

    this.loaderService.showLoader()
    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    }
    else {
      authObs = this.authService.signup(email, password);
    }

    authObs.subscribe(
      async (resData) => {
        this.loaderService.hideLoader()
        await this.router.navigate(['/recipes'])
        form.reset()
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.toast.show(errorMessage, 'error')
        this.loaderService.hideLoader()
      }
    );
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onHandleAlert() {
    this.error = '';
  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

}
