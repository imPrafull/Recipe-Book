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
  id: number;

  constructor(
    private recipeService: RecipeService, 
    private route: ActivatedRoute, 
    private router: Router,
    private location: Location,
    private toast: ToastService,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.recipe = this.recipeService.getRecipe(this.id);
        }
      );
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
    this.recipeService.storeRecipes().subscribe(() => {
      this.loader.hideLoader()
      this.router.navigate(['/recipes']);
    }, err => {
      this.recipeService.addRecipe(deletedRecipe)
      this.loader.hideLoader()
    })
  }

  back() {
    this.location.back()
  }

}
