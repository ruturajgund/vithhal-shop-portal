import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class ProductService{
    
    constructor(private http: Http) { }

    getAllProducts(){
        return this.http.get('/api/getProducts').map((response : Response) => {
            return response;
        });
    }

    saveProducts(products){
        return this.http.post('/api/saveProducts', products).map((response: Response) => {
            return response;
        });
    }
}