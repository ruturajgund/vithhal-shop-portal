import { Component, OnInit} from '@angular/core';
import { User } from '../models/index';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { AuthenticationService } from '../services/index'

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.css']
})


export class DashboardComponent implements OnInit{
    authenticationFlag: boolean = false;
    currentUser: User;
    brandName : string = "Shop Management Portal";

    constructor(
        public slimLoadingBarService : SlimLoadingBarService,
        private authenticationService: AuthenticationService
    ){
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    }

    ngOnInit(){
        if(this.currentUser.role === "ADMIN"){ this.authenticationFlag = true;}
    }

    logout(){
        this.authenticationService.logout();
    }
}