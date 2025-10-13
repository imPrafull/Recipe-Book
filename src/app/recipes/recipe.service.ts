import { Injectable } from '@angular/core';
import { Subject, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class RecipeService {

  recipesChanged = new Subject<Recipe[]>();
  private recipes: Recipe[];
  // private recipes: Recipe[] = [
  //   new Recipe(
  //     'Tasty Schnitzel',
  //     'A super-tasty schnitzel - just awesome!',
  //     'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.jpg',
  //     [
  //       new Ingredient('Meat', 1),
  //       new Ingredient('French Fries', 20)
  //     ]
  //   ),
  //   new Recipe(
  //     'Big Fat Burger',
  //     'What else you need to say?',
  //     'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg',
  //     [
  //       new Ingredient('Buns', 2),
  //       new Ingredient('Meat', 1)
  //     ]
  //   )
  // ];

  constructor(
    private slService: ShoppingListService,
    private http: HttpClient,
  ) {}

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  getRecipes() {
    return this.recipes?.slice();
  }

  getLocalRecipe(recipeId: string) {
    return this.recipes?.find(recipe => recipe.id === recipeId)
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }

  addRecipe(recipe: Recipe) {
    this.recipes ? this.recipes.push(recipe) : this.recipes = [recipe];
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(id: string, newRecipe: Recipe) {
    if (!this.recipes) return;

    const index = this.recipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
      const oldRecipe = this.recipes[index]
      this.recipes[index] = { ...oldRecipe, ...newRecipe };
      this.recipesChanged.next(this.recipes.slice());
      this.storeRecipes();
    }
  }

  deleteRecipe(id: string) {
    if (!this.recipes) return null;

    const index = this.recipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
      const deletedRecipe = this.recipes.splice(index, 1);
      this.recipesChanged.next(this.recipes.slice());
      return deletedRecipe[0];
    }
    return null;
  }

  addRecipeAPI(recipe: Recipe) {
    return this.http.post<Recipe>(environment.baseUrl + '/recipes', recipe)
  }

  updateRecipeAPI(id: string, recipe: Recipe) {
    return this.http.patch<Recipe>(environment.baseUrl + '/recipes/' + id, recipe)
  }

  storeRecipes() {
    return this.http.put('https://recipe-and-shopping-61dca.firebaseio.com/recipes.json', this.recipes)
  }

  fetchRecipes() {
    return this.http.get<Recipe[] | null>(environment.baseUrl + '/recipes?sortBy=createdAt:asc')
      .pipe(
        map(recipes => {
          if (!recipes) return []
          
          return recipes.map(recipe => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
        }),
        tap(recipes => this.setRecipes(recipes))
      );
  }

  fetchRecipe(recipeId: string) {
    // First check if we have the recipe locally
    const localRecipe = this.getLocalRecipe(recipeId);
    if (localRecipe) {
      // If found locally, return it as an Observable
      return of(localRecipe);
    }
    // If not found locally, fetch from API
    return this.http.get<Recipe>(environment.baseUrl + '/recipes/' + recipeId);
  }

  deleteRecipeAPI(recipeId: string) {
    return this.http.delete<Recipe>(environment.baseUrl + '/recipes/' + recipeId)
  }

}
