import { Observable } from "rxjs";

export class CoffeeFileUtil {
    /**
     * Ensure that the form is validated
     */
    fileToBase64(data: { file: File }): Observable<string> {
        return new Observable(observer => {
            var reader = new FileReader();
            reader.readAsDataURL(data.file);
            reader.onload = () => {
                observer.next(reader.result as string);
                observer.complete();
            };
            reader.onerror = (error) => {
              observer.error(error);
              observer.complete();
            };
        });
    }

    base64ToFile(base64String: string, fileNameWithExtension: string): Observable<{ file: File }> {
        return new Observable(observer => {
            const arr = base64String.split(',') as any;

            if(!arr) {
                observer.error("Invalid base 64 string");
                observer.complete();
                return;
            }

            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length as any;
            const u8arr = new Uint8Array(n);
        
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            observer.next({ file: new File([u8arr], fileNameWithExtension, { type: mime }) });
            observer.complete();
        });
    }
     
}