import { AfterViewInit, Component, Input,OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CoffeeFileUploadContext } from './models/file-upload-context';
import { SingleFileUploadComponent } from './single-file-upload/single-file-upload.component';
import { MultipleFileUploadComponent } from './multiple-file-upload/multiple-file-upload.component';
import { Subject } from 'rxjs';
import { CoffeeFileUpload } from './models/file-upload';

@Component({
  selector: 'ngx-coffee-file-upload',
  templateUrl: './coffee-file-upload.component.html'
})
export class CoffeeFileUploadComponent implements OnInit, AfterViewInit {
  hasInit = false;

  @Input() type: "default" | "multiple" = "default";
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() storageBucket = 'default';
  @Output() onNewFileUploaded = new Subject<any>();

  @ViewChildren(SingleFileUploadComponent) private fileUploadComponents: QueryList<SingleFileUploadComponent>;
  @ViewChildren(MultipleFileUploadComponent) private multipleFileUploadComponents: QueryList<MultipleFileUploadComponent>;

  constructor() { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.hasInit = true;
    }, 0)
  }

  ngOnInit(): void {}

  get file(): CoffeeFileUploadContext {
    if (!this.fileUploadComponents || !this.fileUploadComponents.first || !this.hasInit) {
      return new CoffeeFileUploadContext();
    }
    return this.fileUploadComponents.first.context;
  }

  get files(): CoffeeFileUploadContext[]  {
    if (!this.multipleFileUploadComponents || !this.multipleFileUploadComponents.first || 
        !this.multipleFileUploadComponents.first.fileUploadComponents ||
        !this.multipleFileUploadComponents.first.fileUploadComponents.length
        || !this.hasInit
      ) {
      return [new CoffeeFileUploadContext()];
    }

    return this.multipleFileUploadComponents.first.fileUploadComponents.map(component => component.context);
  }

  click(): void  {
    if(this.type == 'multiple') {
      if (!this.multipleFileUploadComponents || !this.multipleFileUploadComponents.first) {
        return;
      }
  
      return this.multipleFileUploadComponents.first.triggerFileSelection();
    }

    if (!this.fileUploadComponents || !this.fileUploadComponents.first) {
      return;
    }

    return this.fileUploadComponents.first.context.click();
  }

}
