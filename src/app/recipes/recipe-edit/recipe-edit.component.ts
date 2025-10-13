import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgForm, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Location } from '@angular/common';

import { RecipeService } from '../recipe.service';
import { LoaderService } from 'src/app/shared/loading-spinner/loader.service';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {

  recipeForm: FormGroup;
  id: string;
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
    const params = this.route.snapshot.params;
    this.id = params['id'];
    this.editMode = params['id'] != null;
    this.initForm();
  }

  private initForm() {
    this.recipeForm = new FormGroup({
      name: new FormControl('', Validators.required),
      coverImg: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      ingredients: new FormArray<FormGroup>([])
    });
    
    // If we're editing, fetch recipe and patch form values
    if (this.editMode) {
      this.recipeService.fetchRecipe(this.id).subscribe(recipe => {
        this.recipeForm.patchValue({
          name: recipe.name,
          coverImg: recipe.coverImg,
          description: recipe.description
        });

        const ingredientsArray = this.recipeForm.get('ingredients') as FormArray;
        ingredientsArray.clear(); // clear any default controls

        if (recipe.ingredients) {
          for (let ingredient of recipe.ingredients) {
            ingredientsArray.push(
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
      });
    }
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
    let recipeBackup: Recipe | undefined;
    if (this.editMode) {
      recipeBackup = this.recipeService.getLocalRecipe(this.id)
      this.recipeService.updateRecipe(this.id, this.recipeForm.value)
      this.recipeService.updateRecipeAPI(this.id, this.recipeForm.value).subscribe({
        next: (res) => {
          this.loader.hideLoader()
          this.back();
        },
        error: (err) => {
          if (this.editMode && recipeBackup) {
            this.recipeService.updateRecipe(this.id, recipeBackup)
          }
          this.loader.hideLoader()
        }
      })
    } else {
      const tempId = Date.now().toString()
      const newRecipe = { ...this.recipeForm.value, id: tempId };

      // Add locally with temporary ID
      this.recipeService.addRecipe(newRecipe);

      this.recipeService.addRecipeAPI(this.recipeForm.value).subscribe({
        next: (res) => {
          // Replace temp ID with the one from the server
          this.recipeService.updateRecipe(tempId, res);
          this.loader.hideLoader()
          this.back();
        },
        error: (err) => {
          this.recipeService.deleteRecipe(tempId)
          this.loader.hideLoader()
        }
      })
    }
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
