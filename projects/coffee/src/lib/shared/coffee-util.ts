export namespace CoffeeUtil {
    
  export const concatUrl = (currentUrl: string, suffixUrl: string | number): string => {
    if(!suffixUrl) {
      return currentUrl;
    }

    let parsedSuffixUrl = String(suffixUrl);

    if(!parsedSuffixUrl) {
      return currentUrl;
    }
    
    if(currentUrl.endsWith("/")) {
        currentUrl = currentUrl.substring(0, currentUrl.length - 1);
    }
   
    if(parsedSuffixUrl.startsWith("/")) {
        parsedSuffixUrl = parsedSuffixUrl.substring(1, parsedSuffixUrl.length);
    }

    return `${currentUrl}/${parsedSuffixUrl}`;
  }
  
  export const convertModelToFormData = (val: any, formData = new FormData(), namespace = ''): FormData => {
    if (typeof val !== 'undefined' && val !== null) {
      if (val instanceof Date) {
        formData.append(namespace, val.toISOString());
      } else if (val instanceof Array) {
        for (let index = 0; index < val.length; index++) {
          const element = val[index];
          CoffeeUtil.convertModelToFormData(
            element,
            formData,
            namespace + '[' + index + ']'
          );
        }
      } else if (typeof val === 'object' && !(val instanceof File)) {
        for (const propertyName in val) {
          if (val.hasOwnProperty(propertyName)) {
            CoffeeUtil.convertModelToFormData(
              val[propertyName],
              formData,
              namespace ? namespace + '.' + propertyName : propertyName
            );
          }
        }
      } else if (val instanceof File) {
        formData.append(namespace, val);
      } else {
        formData.append(namespace, val.toString());
      }
    }
    return formData;
  }

  export const formatCoffeeLogMessage = (content: string): string => {
    const logHeader = '### 📒 COFFEE LOG ###';
    return `${logHeader}\n${content}\n${logHeader}`;
  }
}