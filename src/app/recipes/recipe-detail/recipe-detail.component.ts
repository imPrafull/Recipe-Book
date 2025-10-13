import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ToastService } from 'src/app/shared/toast.service';
import { LoaderService } from 'src/app/shared/loading-spinner/loader.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: string;

  constructor(
    private recipeService: RecipeService, 
    private route: ActivatedRoute, 
    private router: Router,
    private location: Location,
    private toast: ToastService,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    const recipeId = this.route.snapshot.params['id'];
    this.id = recipeId;
    this.loader.showLoader();
    
    this.recipeService.fetchRecipe(recipeId).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.loader.hideLoader();
      },
      error: (error) => {
        this.loader.hideLoader();
        this.toast.show('Error loading recipe', 'error');
        this.router.navigate(['/recipes']);
      }
    });
  }

  onAddToShoppingList() {
    this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
    this.toast.show('Items Added to Shopping List!', 'success')
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    this.loader.showLoader()
    const deletedRecipe = this.recipeService.deleteRecipe(this.id)
    this.recipeService.deleteRecipeAPI(this.id).subscribe({
      next: () => {
      this.loader.hideLoader()
      this.router.navigate(['/recipes']);
    },
    error: err => {
      if (deletedRecipe) this.recipeService.addRecipe(deletedRecipe)
      this.loader.hideLoader()
    }})
  }

  back() {
    this.location.back()
  }

}
