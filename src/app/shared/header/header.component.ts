import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { DataStorageService } from '../data-storage.service';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string
  @Input() centeredTitle = false

  constructor(private dataStorageService: DataStorageService, private authService: AuthService) {}

  ngOnInit() {
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchdata() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  ngOnDestroy() {
  }

}
