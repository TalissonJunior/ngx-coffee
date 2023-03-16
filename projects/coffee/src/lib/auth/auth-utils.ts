export namespace AuthUtils {
    export const storageKey = 'sk';
    export const userKey = 'usk';
    
    export const clearTokens = (): void => {
        localStorage.clear();
    }

    export const saveToken = (token: string): void => {
        localStorage.setItem(storageKey, token);
    }

    export const getToken = (): string | null => {
        return localStorage.getItem(storageKey);
    }

    export const setUserProperty = (user: any, property: string, value: any): void => {
        if(!user || !user.id){
            return;
        }
        
        let savedValue = {} as any;

        try {
            var storageValue = localStorage.getItem(userKey);

            if(storageValue) {
                savedValue = JSON.parse(storageValue);
            }
        }
        catch {}

        savedValue[user.id + '_' + property] = JSON.stringify(value);
        localStorage.setItem(userKey, JSON.stringify(savedValue));
        user[property] = value;
    }

    export const getUserProperty = (user: any, property: string): any => {
        if(!user || !user.id){
            return null;
        }
        
        let savedValue = {} as any;

        try {
            var storageValue = localStorage.getItem(userKey);

            if(storageValue) {
                savedValue = JSON.parse(storageValue);
            }

            return JSON.parse(savedValue[user.id + '_' + property]);
        }
        catch {
            return null;
        }
    }
}