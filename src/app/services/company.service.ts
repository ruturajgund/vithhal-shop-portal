import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class CompanyService{

    constructor(private http: Http) { }

    saveCompany(company){
        return this.http.post('/api/saveCompany', company).map((response: Response) => {
            return response;
        });
    }

    getCompanies(){
        return this.http.get('/api/getCompanies').map((response: Response) => {
            return response;
        });
    }

}