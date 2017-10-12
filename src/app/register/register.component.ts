import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { UserService , AlertService} from '../services/index'
import { User } from '../models/index'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'


@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['register.component.css']
})

export class RegisterComponent{
    model =  new User();
    roles: any[] =[
        {
            'role': 'ADMIN'
        },
        {
            'role': 'MANAGER'
        }
    ];

    constructor(
        private userService : UserService,
        private router : Router,
        private alertService : AlertService,
        private slimLoadingBarService : SlimLoadingBarService
    ){}
    
    register(){
        this.slimLoadingBarService.start();
        this.userService.registerUser(this.model).subscribe(
            data => {
                this.alertService.success('User registered successfully.',true);
                this.slimLoadingBarService.complete();
                this.model = new User();
            }
        );
    };
}