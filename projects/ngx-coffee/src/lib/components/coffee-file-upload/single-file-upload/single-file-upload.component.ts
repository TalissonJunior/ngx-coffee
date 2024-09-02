import { Component, ElementRef, Input, OnDestroy, Output, TemplateRef, ViewChild, AfterViewInit, EventEmitter} from '@angular/core';
import { AbstractControl} from '@angular/forms';
import { CoffeeService } from '../../../coffee.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { CoffeeFileUploadContext } from '../models/file-upload-context';
import { CoffeeFileUpload } from '../models/file-upload';
import { CoffeeUtil } from '../../../shared/coffee-util';

@Component({
  selector: 'app-single-file-upload',
  templateUrl: './single-file-upload.component.html',
})
export class SingleFileUploadComponent implements AfterViewInit, OnDestroy {
  private uploadSubscription: Subscription;

  public previewFile: CoffeeFileUpload | null = null;
  public uploadFailed: boolean = false;
  public uploadedFile:  CoffeeFileUpload | null = null;
  public optimizationInfo: string = '';

  @Input() form: AbstractControl;
  @Input() controlName: string;
  @Input() uploadErrorMessage = 'Upload failed, please try again.';
  @Input() storageBucket = 'default';
  @Input() allowedType: 'images' | 'documents' | 'all' = 'all';
  @Input() customTemplate?: TemplateRef<any>;
  @Input() autoUpload: boolean = true;
  @Input() set externalFile(file: File) {
    if (file) {
        this.onNewFile(file);
    }
  }

  @Output() progressEmitter = new BehaviorSubject<number>(0);
  @Output() onRemove = new Subject<CoffeeFileUpload>();
  @Output() onChange = new Subject<CoffeeFileUpload | null>();
  @Output() onNewCoffeeFileUploaded = new Subject<CoffeeFileUpload>();
  @Output() fileSelected = new EventEmitter<File>(); 
  @Output() onError = new EventEmitter<{ type: string, message: string }>(); 

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef<HTMLInputElement>;

  constructor(
    private coffeeService: CoffeeService
  ) { }

  ngAfterViewInit(): void {
    if (this.form && this.form.get(this.controlName)) {
      this.uploadSubscription = this.form.get(this.controlName)!.valueChanges.subscribe(value => {
        this.handleFileChange(value);
      });

      // Handle the initial value
      this.handleFileChange(this.form.get(this.controlName)!.value);
    }
  }

  ngOnDestroy(): void {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
    this.progressEmitter.complete();
  }

  get context(): CoffeeFileUploadContext {
    return {
      click: () => this.triggerFileSelection(),
      optimizationInfo: this.optimizationInfo,
      progress: this.progressEmitter.value,
      preview: this.previewFile,
      isImage: () => this.isImage(this.previewFile),
      errorMessage: this.uploadFailed ? this.uploadErrorMessage : null,
      actions: {
        preview: () => {
          if (this.previewFile && this.previewFile.id) {
            if (this.isImage(this.previewFile)) {
              this.showImageFullscreen();
            } else {
              window.open(this.previewFile.path);
            }
          }
        },
        remove: () => {
          if (this.uploadedFile) {
            this.onRemove.next(this.uploadedFile);
          }
        },
      }
    };
  }
  
  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (files && files.length > 0) {
      const file = files[0];

      const acceptedTypes = this.getAcceptedFileTypes().split(',');
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some(type => 
        type.trim() === '*/*' || 
        (type.includes('/') && file.type.startsWith(type.split('/')[0])) || 
        (fileExtension && type.includes(`.${fileExtension}`))
      );

      if (isAccepted) {
        this.fileSelected.emit(file);

        if (this.autoUpload) {
          this.onNewFile(file);
        }
      } else {
        this.uploadFailed = true;
        this.progressEmitter.next(0);
        
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
    } else {
      this.progressEmitter.next(0);
    }
  }

  resetUpload(): void {
    this.uploadFailed = false;
    this.progressEmitter.next(0);
    this.form.get(this.controlName)?.setValue(null);
    this.previewFile = null;
    this.uploadedFile = null;
    this.optimizationInfo = '';
    this.clearFileInput();
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
  
  private showImageFullscreen(): void {
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.style.position = 'fixed';
    fullscreenDiv.style.top = '0';
    fullscreenDiv.style.left = '0';
    fullscreenDiv.style.width = '100%';
    fullscreenDiv.style.height = '100%';
    fullscreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    fullscreenDiv.style.display = 'flex';
    fullscreenDiv.style.alignItems = 'center';
    fullscreenDiv.style.justifyContent = 'center';
    fullscreenDiv.style.zIndex = '999999';

    const imageElement = document.createElement('img');
    imageElement.src = this.previewFile!.path;
    imageElement.style.maxWidth = '100%';
    imageElement.style.maxHeight = '100%';

    fullscreenDiv.appendChild(imageElement);
    document.body.appendChild(fullscreenDiv);

    fullscreenDiv.addEventListener('click', () => {
      document.body.removeChild(fullscreenDiv);
    });
  }

  private isImage(file: CoffeeFileUpload | null): boolean {
    if(!file) {
      return false;
    }

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jfif', 'tiff', 'webp', 'svg', 'ico'];
    const path = file.extension ? file.extension : file.path;

    // Check if the uploaded file has a valid extension
    if (path) {
      const paths = path.toLowerCase().split(".").map(e => e);
      const lowerCaseExtension = paths[paths.length - 1];

      return imageExtensions.includes(lowerCaseExtension);
    }
    
  
    return false;
  }

  private onNewFile(file: File): void {
    this.resetUpload();
    this.updateFilePreview(file);
    this.uploadFile(file);
    this.onChange.next({ inProgress: true } as any);
  }
  
  private triggerFileSelection(): void {
    this.fileInput.nativeElement.click();
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  private getFileNameWithoutExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
  }

  private handleFileChange(file: any): void {

    if(file instanceof File) {
      this.onNewFile(file);
      return;
    }

    if (file && file.path) {
      this.uploadedFile = file;
      this.previewFile = file;
      this.progressEmitter.next(100);

      if (file.size) {
        const formattedSize = this.formatFileSize(file.size);
        this.optimizationInfo = `The image is ${formattedSize}.`;
      }
    }
  }

  private updateFilePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewFile = new CoffeeFileUpload({
        name: this.getFileNameWithoutExtension(file.name),
        size: file.size,
        extension: this.getFileExtension(file.name),
        path: reader.result as string,
        createdAt: new Date().toISOString()
      });
    };
    reader.readAsDataURL(file);
  }

  private uploadFile(file: File): void {
    // Simulate upload progress
    this.progressEmitter.next(1);
    let progress = 1;
    const interval = setInterval(() => {
      progress = Math.min(progress + 1, 99);
      this.progressEmitter.next(progress);
    }, 200);

    // Replace with actual upload logic
    this.coffeeService.save<CoffeeFileUpload>(`coffee/file/storage/${this.storageBucket}`, { file: file } as any, true)
      .subscribe({
        next: (data) => {
          clearInterval(interval);
          this.progressEmitter.next(100);
          this.form.get(this.controlName)?.setValue(data);
          this.previewFile = data;
          this.uploadedFile = data;
          this.updateOptimizationInfo(file.size, data.size);
          this.clearFileInput();
          this.onNewCoffeeFileUploaded.next(data);
          this.onChange.next(data);
        },
        error: () => {
          clearInterval(interval);
          this.progressEmitter.next(0);
          this.uploadFailed = true;
          this.uploadedFile = null;
          this.form.get(this.controlName)?.setValue(null);
          this.onChange.next(null);
        }
      });
  }

  private updateOptimizationInfo(originalSize: number, newSize: number): void {
    const original = this.formatFileSize(originalSize);
    const optimized = this.formatFileSize(newSize);
    this.optimizationInfo = `Optimized from ${original} to ${optimized}.`;
  }

  private formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private clearFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}