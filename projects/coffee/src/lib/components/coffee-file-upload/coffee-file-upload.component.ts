import { AfterViewInit, Component, EventEmitter, Input,OnInit, Output, QueryList, ViewChildren } from '@angular/core';
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
  @Input() autoUpload: boolean = true;
  @Input() fileToUpload: File;
  @Output() onNewFileUploaded = new Subject<any>();
  @Output() hasFilesInProgress = new EventEmitter<boolean>();
  @Output() fileSelected = new EventEmitter<File>();

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

  onFileUploadChange(file: CoffeeFileUpload | null): void {
    if(file && (file as any).inProgress) {
      this.hasFilesInProgress.next(true);
      return;
    }
    else if(file){
      this.onNewFileUploaded.next(file);
    }

    if(this.type == 'multiple') {
      this.hasFilesInProgress.next(this.files.some(file => file.progress > 0 && file.progress < 100));
    }
    else {
      this.hasFilesInProgress.next(this.file.progress > 0 && this.file.progress < 100);
    }
  }

  handleFileSelected(file: File) {
    this.fileSelected.emit(file);
  }

}
