import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultipleFileUploadComponent } from './multiple-file-upload/multiple-file-upload.component';
import { CoffeeFileUploadComponent } from './coffee-file-upload.component';
import { SingleFileUploadComponent } from './single-file-upload/single-file-upload.component';

@NgModule({
  declarations: [
    CoffeeFileUploadComponent,
    MultipleFileUploadComponent,
    SingleFileUploadComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    CoffeeFileUploadComponent,
  ]

})
export class CoffeeFileUploadModule { }
