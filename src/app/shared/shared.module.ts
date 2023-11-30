import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { DropdownDirective } from "./dropdown.directive";
import { LoadingSpinnerComponent } from "./loading-spinner/loading-spinner.component";
import { PlaceholderDirective } from "./placeholder/placeholder.directive";
import { HeaderComponent } from "./header/header.component";

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    PlaceholderDirective,
    DropdownDirective,
    HeaderComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoadingSpinnerComponent,
    PlaceholderDirective,
    DropdownDirective,
    HeaderComponent,
    CommonModule,
  ],
})

export class SharedModule { }