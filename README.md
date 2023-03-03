<a href="http://jsdaddy.io/img/logo.png">
  <h1 align="center">NGX COFFEE</h1>
</a>

<p align="center">
  NGX COFFEE is Angular library for coffee projects
</p>


## Installing

```bash
$ npm install --save ngx-coffee
```

## Quickstart
Import **ngx-coffee** module in Angular app.

### With default config options

```typescript
import { CoffeeModule } from 'ngx-mask'

@NgModule({
  imports: [
     CoffeeModule.forRoot({
      baseApiUrl: 'https://localhost:5001/api',
      auth: {
        linkedIn: {
            clientId: 'your_client_id',
            scope: 'r_emailaddress,profile,openid,email,r_liteprofile',
            redirectUrl: 'http://localhost:4200/redirecionar'
        }
      }
    }),
  ],
})
```

## Usage

inject "CoffeeService" in constructor

```ts
import { CoffeeService } from 'ngx-coffee';

export class PublicComponent implements OnInit {

    constructor(
        private coffeeService: CoffeeService
    ) { }

    ngOnInit(): void {
    }
}
```

## Auth service options

Authenticate with linkedin or LoginPassword

```ts
import { CoffeeService } from 'ngx-coffee';
import { ActivatedRoute } from '@angular/router';

export class PublicComponent implements OnInit {

    constructor(
        private coffeeService: CoffeeService,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
    }

    signInWithLinkedin(): void {

        this.coffeeService.auth().social.signInWithLinkedIn()
        .subscribe({
            next: () => {
                // do something here
            },
            error: () => {
                // handle error
            }
        });
    }

    // after calling signInWithLinkedIn you nee to validate 'code'
    // from the 'redirectUri'
    ngOnInit(): void {
        const code = this.activatedRoute.snapshot.queryParamMap.get('code');

        if(code) {
            this.coffeeService.auth().social.validateLinkedInSignIn(code)
            .subscribe({
                next: () => {
                    window.close();
                },
                error: () => {
                     window.close();
                }
            });
        }
    }

    siginWithLoginPassword(): void {
        const model = {
            login: "myemail@email.com",
            password: "123"
        };

        this.coffeeService.auth().siginWithLoginPassword(model)
        .subscribe({
            next: () => {
                // do something here
            },
            error: (error) => {
                // handle error
            }
        });
    }
}
```

Check if user is authenticated, and get the current user data

```ts
import { CoffeeService } from 'ngx-coffee';
import { User } from 'src/app/models/user';

export class PublicComponent implements OnInit {
  currentUser: User;

    constructor(
        private coffeeService: CoffeeService
    ) { }

    ngOnInit(): void {
        this.isAuthenticated();
    }

    private isAuthenticated(): void {
        this.coffeeService.auth<User>(User).isLoggedIn().subscribe({
            next: isAuthenticated => {
                this.getCurrentUser();
                // do something here
            },
            error: (error) => {
                // handle error
            }
        });
    }

    public getCurrentUser(): void {
        this.coffeeService.auth<User>(User).getCurrentUser()
        .subscribe(user => {
            this.currentUser = user;
        });

    }
}
```


## Http services and filters
```ts
import { CoffeeService } from 'ngx-coffee';
import { User } from 'src/app/models/user';

export class PublicComponent implements OnInit {
  currentUser: User;

    constructor(
        private coffeeService: CoffeeService
    ) { }

    ngOnInit(): void {
        this.isAuthenticated();
    }

    private getData(): void {
        this.coffeeService
        .get<User>('/user')
        .whereContains((model: User) => model.name, "john")
        .where((model: User) => model.age, ">", 25)
        .returnPaginationListOf(User, {
            currentPage: 1,
            pageSize: 10,
        })
        .subscribe({
            next: (snapshot) => {
                // do something here
            },
            error: () => {
                // handle error
            },
        });
    }

    // it will create or update, depending on the model id
    private saveData(): void {
        const model {
            id: 0, // if 0 creates otherwise update
            name: 'John',
            age: 46
        };

        this.coffeeService.save('user', model)
        .subscribe({
            next: () => {
                // do something here
            },
            error: (error) => {
                // handle error
            }
        });
    }

    private createData(): void {
        const model {
            id: 0, // if 0 creates otherwise update
            name: 'John',
            age: 46
        };

        this.coffeeService.create('user', model)
        .subscribe({
            next: () => {
                // do something here
            },
            error: (error) => {
                // handle error
            }
        });
    }

    private updateData(): void {
        const model {
            id: 1, // if 0 creates otherwise update
            name: 'John',
            age: 46
        };

        this.coffeeService.update('user', model)
        .subscribe({
            next: () => {
                // do something here
            },
            error: (error) => {
                // handle error
            }
        });
    }

    private deleteData(): void {
        this.coffeeService.delte('user', 1)
        .subscribe({
            next: () => {
                // do something here
            },
            error: (error) => {
                // handle error
            }
        });
    }
}
```

## Validate forms

force reactive forms validation

```ts
import { CoffeeService } from 'ngx-coffee';

export class PublicComponent implements OnInit {

    constructor(
        private coffeeService: CoffeeService
    ) { }
 
    ngOnInit(): void {
    }

    onSubmit(): void {
        const form = this.fb.group({ 
            name: [null, Validators.Required]
        });

        // will force form validation
        this.coffeeService.forms().validateForm(form);
    }
}
```

## File Utils 

transform Base64String to File or File to Base64String

```ts
import { CoffeeService } from 'ngx-coffee';

export class PublicComponent implements OnInit {

    constructor(
        private coffeeService: CoffeeService
    ) { }
 
    ngOnInit(): void {
    }

    // File to Base64String
    onNewImage(event): void {
        const file = event.target.files[0];
        const form = { file: file };

        this.coffeeService.fileUtils().fileToBase64(form)
        .subscribe({
            next: (base64String) => {
               console.log(base64String);
            },
            error: () => {}
        });
    }

    // Base64String to File
    onPictureTaken(base64String: string): void {
        const file = event.target.files[0];
        const form = { file: file };

        this.coffeeService.fileUtils().base64ToFile(base64String, 'profile.png')
        .subscribe( {
            next: (file) =>{
                // do something here
            },
            error: () => {
                // handle error
            }
        });
    }
}
```