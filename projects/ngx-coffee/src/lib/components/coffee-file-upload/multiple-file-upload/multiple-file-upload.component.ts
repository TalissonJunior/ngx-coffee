import { Component, Input, ViewChildren, QueryList, ElementRef, ViewChild, Output, ChangeDetectorRef, EventEmitter} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SingleFileUploadComponent } from '../single-file-upload/single-file-upload.component';
import { Subject } from 'rxjs';
import { CoffeeFileUpload } from '../models/file-upload';
import { CoffeeUtil } from '../../../shared/coffee-util';

@Component({
  selector: 'app-multiple-file-upload',
  templateUrl: './multiple-file-upload.component.html',
})
export class MultipleFileUploadComponent {
  filesForm: FormGroup;
  hasInitFormWithValues = false;

  @Input() allowedType: 'images' | 'documents' | 'all' = 'all';
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() storageBucket: string;
  @Output() onNewFileUploaded = new Subject<CoffeeFileUpload | null>();
  @Output() onError = new EventEmitter<{ type: string, message: string }>(); 
  
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
    const acceptedTypes = this.getAcceptedFileTypes().split(',');
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAccepted = acceptedTypes.some(type => 
      type.trim() === '*/*' || 
      (type.includes('/') && file.type.startsWith(type.split('/')[0])) || 
      (fileExtension && type.includes(`.${fileExtension}`))
    );


    if (isAccepted) {
    this.hasInitFormWithValues = true;

    const form = this.fb.group({
      file: [file]
    });

    (this.filesForm.get('files') as FormArray).push(form);
    this.cd.detectChanges(); 
    } else {
      // Custom log header and improved error message
      const allowedTypes = this.getAcceptedFileTypes();
      const selectedType = file.type || `.${fileExtension}`;
      const fileName = file.name;

              
      const errorMsgContent = 
      `Selected file '${fileName}' has a type '${selectedType}' which is not allowed.\n` +
      `Allowed types are: ${allowedTypes}.\n\n` +
      `To handle this error, use the (onError) event like the example below:\n\n` +
      `<ngx-coffee-file-upload (onError)="yourMethod($event)">...</ngx-coffee-file-upload>\n\n` +
      `This will emit the error and prevent it from being logged to the console.`;

      const errorMsg = CoffeeUtil.formatCoffeeLogMessage(errorMsgContent);

      this.onError.emit({
        type: 'fileType',
        message: errorMsg,
      });
    }

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

  private getAcceptedFileTypes(): string {
    switch (this.allowedType) {
      case 'images':
        return 'image/*';
      case 'documents':
        return 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return '*/*';
    }
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
