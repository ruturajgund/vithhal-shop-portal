import { Component} from '@angular/core';
import { User } from '../../models/index';
import { UserService, AlertService } from '../../services/index'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'

@Component({
    templateUrl: 'account.component.html',
    styleUrls: ['../dashboard.css']
})

export class AccountComponent{

    accountDetails =  new User();
    message: string;

    constructor(
        private userService : UserService,
        private alertService : AlertService,
        private slimLoadingBarService : SlimLoadingBarService
    ){
        this.accountDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

    updateUser(){
        this.slimLoadingBarService.start();
        this.userService.updateUser(this.accountDetails).subscribe(
            respone => {
                var data = respone.json();
                if(data.currentUser){
                    localStorage.setItem('currentUser', JSON.stringify(data.currentUser));
                }
                if(data.status == 200){
                    this.alertService.success(data.message);
                }
                else{
                    this.alertService.error(data.message);
                }
                this.slimLoadingBarService.complete();
            }
        );
    }
}