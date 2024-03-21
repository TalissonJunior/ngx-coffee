import { Component, ElementRef, Input, OnDestroy, Output, TemplateRef, ViewChild, AfterViewInit} from '@angular/core';
import { AbstractControl} from '@angular/forms';
import { CoffeeService } from '../../../coffee.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { CoffeeFileUploadContext } from '../models/file-upload-context';
import { CoffeeFileUpload } from '../models/file-upload';

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
  @Input() customTemplate?: TemplateRef<any>;
  @Output() progressEmitter = new BehaviorSubject<number>(0);
  @Output() onRemove = new Subject<CoffeeFileUpload>();
  @Output() onChange = new Subject<CoffeeFileUpload | null>();
  @Output() onNewCoffeeFileUploaded = new Subject<CoffeeFileUpload>();

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
      this.onNewFile(files[0]);
    } else {
      this.progressEmitter.next(0);
    }
  }

  resetUpload(): void {
    if (this.uploadedFile) {
      this.removeUploadedFile(this.uploadedFile);
    }

    this.uploadFailed = false;
    this.progressEmitter.next(0);
    this.form.get(this.controlName)?.setValue(null);
    this.previewFile = null;
    this.uploadedFile = null;
    this.optimizationInfo = '';
    this.clearFileInput();
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

  private removeUploadedFile(file: CoffeeFileUpload): void {
    if (file.id) {
      this.coffeeService.delete(`fileupload/storage/${this.storageBucket}`, file.id).subscribe();
    }
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
    this.coffeeService.save<CoffeeFileUpload>(`fileupload/storage/${this.storageBucket}`, { file: file } as any, true)
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