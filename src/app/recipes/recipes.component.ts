import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private recipeService: RecipeService
  ) { }

  ngOnInit() {
    const recipes = this.recipeService.getRecipes()
    if(!recipes || recipes?.length < 1) {
      this.recipeService.fetchRecipes().subscribe();
    }
  }

  onShoppingList() {
    this.router.navigate(['shopping-list'])
  }

  onLogout() {
    this.authService.logout();
  }

}
