import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class CounterService{
    
    constructor(private http: Http) { }

    getBillCounter(){
        return this.http.get('/api/getBillCounter').map((response : Response) => {
            return response;
        });
    }
}