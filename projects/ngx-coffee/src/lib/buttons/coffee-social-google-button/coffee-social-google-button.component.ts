import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, inject } from '@angular/core';
import { CONFIG, IConfig } from '../../coffee-config';
import { CoffeeAuthSocial } from '../../auth/models/coffee-auth-social';

declare var google: any;

// [https://developers.google.com/identity/gsi/web/reference/html-reference#element_with_class_g_id_signin]
@Component({
  selector: 'ngx-coffee-social-google-button',
  templateUrl: './coffee-social-google-button.component.html',
})
export class CoffeeSocialGoogleButtonComponent implements AfterViewInit {
  private config = inject<IConfig>(CONFIG);

  errorMessage = '';

  @Input() type: 'standard' | 'icon' = 'standard';
  @Input() theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline';
  @Input() size: 'large' | 'medium' | 'small' = 'large';
  @Input() text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin' = 'signin_with';
  @Input() shape: 'rectangular' | 'pill' | 'circle' | 'square' = 'rectangular';
  @Input() logoAlignment: 'left' | 'center' = 'left';
  @Input() width = 400;

  @Output() onResponse = new EventEmitter<CoffeeAuthSocial>();

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit(): void {
    if(!this.config?.auth?.google?.clientId) {
      this.errorMessage = 'Google Authentication Configuration Missing: Ensure that the "auth" ' +
      'configuration property is provided when calling "CoffeeModule.forRoot({})"'+
      ' and that it includes "google" authentication settings.';

      throw Error(this.errorMessage);
    }
    
    this.loadScript('https://accounts.google.com/gsi/client', () => {
      const element = this.elementRef.nativeElement.querySelector('#google-button');
      this.init(element);
    });
  }

  private loadScript(scriptUrl: string, callback: () => void): void {
    const script = this.renderer.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    this.renderer.appendChild(this.elementRef.nativeElement, script);
  }

  private init(element: HTMLElement): void {
    google.accounts.id.initialize({
      client_id: this.config.auth?.google?.clientId,
      callback: (response: any) => this.handleGoogleSignIn(response)
    });

    google.accounts.id.renderButton(element, { 
      type: this.type,
      size: this.size,
      theme: this.theme,
      text: this.text,
      shape: this.shape,
      logoAlignment: this.logoAlignment,
      width: this.width
    });
  }

  private handleGoogleSignIn(response: { credential: string }): void {
    let base64Url = response.credential.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    let userData = JSON.parse(jsonPayload);

    const model = {
      id: userData.sub,
      name: userData.name,
      email: userData.email,
      photoUrl: userData.picture
    } as CoffeeAuthSocial;
     
    this.onResponse.emit(model); 
  }
}