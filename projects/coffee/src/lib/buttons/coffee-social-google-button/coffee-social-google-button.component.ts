import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, inject } from '@angular/core';
import { CONFIG, IConfig } from '../../coffee-config';
import { CoffeeService } from '../../coffee.service';

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

  @Output() signInSuccess = new EventEmitter<any>();
  @Output() signInError = new EventEmitter<string>();
  @Output() loadingChange = new EventEmitter<boolean>(); 

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private coffeeService: CoffeeService
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
    // This next is for decoding the idToken to an object if you want to see the details.
    let base64Url = response.credential.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    let userData = JSON.parse(jsonPayload);
     
    this.emitLoading(true); 

    this.coffeeService.save(`user/socialmedia/Google`, {
      'name': userData.name,
      'email': userData.email,
      'photoUrl': userData.picture,
      'id': userData.sub
    }, true)
    .subscribe({
      next: (data) => {
        this.emitLoading(false);
        this.signInSuccess.emit(data);
      },
      error: (error) => {
        this.emitLoading(false);
        this.signInError.emit(`Failed to save user data: ${error}`);
      }
    });
  }

  private emitLoading(isLoading: boolean): void {
    this.loadingChange.emit(isLoading);
  }
}