import { PLATFORM_ID } from '@angular/core';
import { PlatformService } from '../services/platform.service';

export namespace AuthUtils {
  export const storageKey = 'sk';
  export const userKey = 'usk';

  const platformService = new PlatformService(PLATFORM_ID);

  export const clearTokens = (): void => {
    if (platformService.isBrowser()) {
      localStorage.clear();
    }
  };

  export const saveToken = (token: string): void => {
    if (platformService.isBrowser()) {
      localStorage.setItem(storageKey, token);
    }
  };

  export const getToken = (): string | null => {
    if (platformService.isBrowser()) {
      return localStorage.getItem(storageKey);
    }
    return null;
  };

  export const setUserProperty = (user: any, property: string, value: any): void => {
    if (!user || !user.id) {
      return;
    }

    if (platformService.isBrowser()) {
      let savedValue = {} as any;

      try {
        const storageValue = localStorage.getItem(userKey);

        if (storageValue) {
          savedValue = JSON.parse(storageValue);
        }
      } catch {}

      savedValue[user.id + '_' + property] = JSON.stringify(value);
      localStorage.setItem(userKey, JSON.stringify(savedValue));
      user[property] = value;
    }
  };

  export const getUserProperty = (user: any, property: string): any => {
    if (!user || !user.id) {
      return null;
    }

    if (platformService.isBrowser()) {
      let savedValue = {} as any;

      try {
        const storageValue = localStorage.getItem(userKey);

        if (storageValue) {
          savedValue = JSON.parse(storageValue);
        }

        return JSON.parse(savedValue[user.id + '_' + property]);
      } catch {
        return null;
      }
    }

    return null;
  };
}
