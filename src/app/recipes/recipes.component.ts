import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private dataStorageService: DataStorageService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onShoppingList() {
    this.router.navigate(['shopping-list'])
  }

  onLogout() {
    this.authService.logout();
  }

}
