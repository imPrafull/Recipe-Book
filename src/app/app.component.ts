import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { LoaderService } from './shared/loading-spinner/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private authService: AuthService,
    public loaderService: LoaderService,
  ) {}

  ngOnInit() {
    this.authService.autoLogin();
  }

}
