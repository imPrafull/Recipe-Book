import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgForm, FormGroup, FormControl, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  previewUrl: string | ArrayBuffer | null = null;
  fileSelected = false;
  isDragOver = false;
  fileInput: File | null = null; // Store the file directly

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
      coverImg: new FormControl(''),
      description: new FormControl('', Validators.required),
      ingredients: new FormArray<FormGroup>([])
    });
    
    // If we're editing, fetch recipe and patch form values
    if (this.editMode) {
      this.recipeService.fetchRecipe(this.id).subscribe(recipe => {
        // Don't patch coverImg - file input cannot be set programmatically
        this.recipeForm.patchValue({
          name: recipe.name,
          description: recipe.description
        }, { emitEvent: false });

        // Set preview URL from existing image path
        this.previewUrl = recipe.coverImgUrl;
        this.fileSelected = true; // Mark as file selected in edit mode
        this.fileInput = null; // No new file selected yet

        const ingredientsArray = this.recipeForm.get('ingredients') as FormArray;
        ingredientsArray.clear();

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

  onFileSelected(event: any) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.handleImageFile(file);
    }
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
    this.isSubmitted = true;
    
    // For new recipes, file must be selected
    if (!this.editMode && !this.fileSelected) {
      return;
    }
    
    if (!this.recipeForm.valid) {
      return;
    }

    this.loader.showLoader();
    let recipeBackup: Recipe | undefined;
    const formData = new FormData();
    
    formData.append('name', this.recipeForm.get('name')?.value);
    formData.append('description', this.recipeForm.get('description')?.value);
    
    // Only append image if a new file was selected (stored in this.fileInput)
    if (this.fileInput) {
      formData.append('coverImg', this.fileInput);
    }
    
    // Append ingredients as JSON string
    formData.append('ingredients', JSON.stringify(this.recipeForm.get('ingredients')?.value));

    if (this.editMode) {
      recipeBackup = this.recipeService.getLocalRecipe(this.id);
      this.recipeService.updateRecipeAPI(this.id, formData).subscribe({
        next: (res) => {
          this.recipeService.updateRecipe(this.id, res);
          this.loader.hideLoader();
          this.back();
        },
        error: (err) => {
          if (this.editMode && recipeBackup) {
            this.recipeService.updateRecipe(this.id, recipeBackup);
          }
          this.loader.hideLoader();
        }
      });
    } else {
      const tempId = Date.now().toString();
      const newRecipe = { ...this.recipeForm.value, id: tempId };

      this.recipeService.addRecipeAPI(formData).subscribe({
        next: (res) => {
          this.recipeService.addRecipe(res);
          this.loader.hideLoader();
          this.back();
        },
        error: (err) => {
          this.loader.hideLoader();
        }
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.handleImageFile(file);
    }
  }

  handleImageFile(file: File) {
    if (file) {
      this.fileSelected = true;
      this.fileInput = file; // Store the file reference
      this.recipeForm.get('coverImg')?.markAsTouched();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.onerror = () => {
        this.recipeImgError({ target: { src: '' } });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.previewUrl = null;
    this.fileSelected = false;
    this.fileInput = null; // Clear the stored file
    this.recipeForm.patchValue({ coverImg: null });
  }

  recipeImgError(e: any) {
    e.target.src = 'assets/images/placeholder-image.jpg';
  }

  back() {
    this.location.back();
  }

  onDeleteIngredient(index: number) {
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  ngOnDestroy(): void {
    this.isSubmitted = false;
  }

}