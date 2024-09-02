import { CoffeeFileUpload } from "./file-upload";


export class CoffeeFileUploadContext {
    click: () => void;
    optimizationInfo: string = '';
    progress: number = 0;
    preview: CoffeeFileUpload | null = null;
    isImage: () => boolean = () => false;
    errorMessage: string | null = '';
    actions: {
        preview: () => void;
        remove:  () => void;
    }
}