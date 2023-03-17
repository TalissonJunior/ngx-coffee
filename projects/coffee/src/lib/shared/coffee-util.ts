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
}