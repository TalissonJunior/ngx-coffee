import { Component, Input, ViewChildren, QueryList, ElementRef, ViewChild, Output, ChangeDetectorRef, EventEmitter} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SingleFileUploadComponent } from '../single-file-upload/single-file-upload.component';
import { Subject } from 'rxjs';
import { CoffeeFileUpload } from '../models/file-upload';

@Component({
  selector: 'app-multiple-file-upload',
  templateUrl: './multiple-file-upload.component.html',
})
export class MultipleFileUploadComponent {
  filesForm: FormGroup;
  hasInitFormWithValues = false;

  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() storageBucket: string;
  @Output() onNewFileUploaded = new Subject<CoffeeFileUpload | null>();
  
  @ViewChildren(SingleFileUploadComponent) fileUploadComponents: QueryList<SingleFileUploadComponent>;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.filesForm = this.createForm();

    // Add existing images
    const images = this.form.get(this.controlName)!.value;

    if(images) {
      images.forEach((file: CoffeeFileUpload | undefined) => { this.add(file); });
      this.hasInitFormWithValues = true;
    }
    else {
      const subscription = this.form.get(this.controlName)!.valueChanges.subscribe((newFiles) => {
        if(!this.hasInitFormWithValues) {
          newFiles.forEach((file: CoffeeFileUpload | undefined) => { this.add(file); });
          this.hasInitFormWithValues = true;
        }
        
        subscription.unsubscribe();
      });
    }
  }

  get filesArray(): FormArray {
    return this.filesForm.get('files') as FormArray;
  }

  triggerFileSelection(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (!files || !files.length) { 
      return;
    }

    const file = files[0];
    this.hasInitFormWithValues = true;

    const form = this.fb.group({
      file: [file]
    });

    (this.filesForm.get('files') as FormArray).push(form);
    this.cd.detectChanges(); 
  }

  onUploadChange(file: CoffeeFileUpload | null): void {
    this.onNewFileUploaded.next(file);
    
    if(file && (file as any).inProgress) {
      this.add();
    }

    this.cd.detectChanges();
  }

  remove(index: number): void {
    // Get the specific SingleFileUploadComponent instance by index
    const fileUploadComponent = this.fileUploadComponents.toArray()[index];
    if (fileUploadComponent) {
      fileUploadComponent.resetUpload();
    }

    (this.filesForm.get('files') as FormArray).removeAt(index);
    this.cd.detectChanges(); 
  }

  private add(file?: CoffeeFileUpload): void {
    if(!file) {
      return;
    }
    
    const form = this.fb.group({
      file: [file]
    });

    (this.filesForm.get('files') as FormArray).push(form);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      files: this.fb.array([])
    });
  }
  
}
