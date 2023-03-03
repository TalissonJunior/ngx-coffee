export namespace AuthUtils {
    export const storageKey = 'ats';
    
    export const clearTokens = (): void => {
        localStorage.clear();
    }

    export const saveToken = (token: string): void => {
        localStorage.setItem(storageKey, token);
    }

    export const getToken = (): string | null => {
        return localStorage.getItem(storageKey);
    }
}