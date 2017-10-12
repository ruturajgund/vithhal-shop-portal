import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class UserService {
    constructor(private http: Http) { }

    registerUser(user){
        return this.http.post('/api/register', user)
        .map((response: Response) => {
            // // login successful if there's a jwt token in the response
            // let user = response.json();
            // if (user && user.token) {
            //     // store user details and jwt token in local storage to keep user logged in between page refreshes
            //     localStorage.setItem('currentUser', JSON.stringify(user));
            // }

            // return user;
        });
    }

    updateUser(user){
        return this.http.post('/api/updateUserDetails', user).map((response: Response) => {
            return response;
        });
    }
   
}