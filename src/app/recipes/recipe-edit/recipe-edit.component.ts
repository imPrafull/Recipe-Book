import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgForm, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Location } from '@angular/common';

import { RecipeService } from '../recipe.service';
import { LoaderService } from 'src/app/shared/loading-spinner/loader.service';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {

  recipeForm: FormGroup;
  id: number;
  editMode = false;
  isSubmitted: boolean;

  constructor(
    private route: ActivatedRoute, 
    private recipeService: RecipeService, 
    private router: Router,
    private location: Location,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          this.initForm();
        }
      );
  }

  private initForm() {
    let recipeName = '';
    let recipeCoverImg = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray<FormGroup>([]);

    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.id);
      recipeName = recipe.name;
      recipeCoverImg = recipe.coverImg;
      recipeDescription = recipe.description;
      if (recipe['ingredients']) {
        for (let ingredient of recipe.ingredients) {
          recipeIngredients.push(
            new FormGroup({
              name: new FormControl(ingredient.name, Validators.required),
              amount: new FormControl(ingredient.amount, [
                Validators.required,
                // Validators.pattern(/^[1-9]+[0-9]*$/)
              ])
            })
          );
        }
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, Validators.required),
      coverImg: new FormControl(recipeCoverImg, Validators.required),
      description: new FormControl(recipeDescription, Validators.required),
      ingredients: recipeIngredients
    });
  }

  get controls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  onAddIngredient() {
    (this.recipeForm.get('ingredients') as FormArray).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(1, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    );
  }

  onSubmit() {
    this.isSubmitted = true
    if (!this.recipeForm.valid) {
      return;
    }
    this.loader.showLoader()
    let recipeBackup
    if (this.editMode) {
      recipeBackup = this.recipeService.getRecipe(this.id)
      this.recipeService.updateRecipe(this.id, this.recipeForm.value)
    }
    else {
      this.recipeService.addRecipe(this.recipeForm.value)
      this.recipeService.addRecipeAPI(this.recipeForm.value).subscribe({
        next: (res) => {
          this.loader.hideLoader()
          this.back();
        },
        error: (err) => {
          this.recipeService.deleteRecipe(this.recipeService.getRecipes().length - 1)
          this.loader.hideLoader()
        }
      })
    }
    // this.recipeService.storeRecipes().subscribe(() => {
    //   this.loader.hideLoader()
    //   this.back();
    // }, err => {
    //   // revert add/edit action if api fails
    //   if (this.editMode) {
    //     this.recipeService.updateRecipe(this.id, recipeBackup!)
    //   } else {
    //   }
    //   this.loader.hideLoader()
    // })
  }

  recipeImgError(e: any) {
    e.target.src = 'assets/images/placeholder-image.jpg'
  }

  back() {
    this.location.back()
  }

  onDeleteIngredient(index: number) {
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  ngOnDestroy(): void {
    this.isSubmitted = false
  }

}
