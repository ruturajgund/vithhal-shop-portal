import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class CustomerService{

    constructor(private http: Http) { }
    
        createCustomer(customer){
            return this.http.post('/api/createCutomer',customer).map((response : Response) => {
                return response;
            });
        }

        getAllCustomers(){
            return this.http.get('/api/getAllCustomers').map((response : Response) => {
                return response;
            });
        }

        getCustomerById(id){
            return this.http.get('/api/getCustomersById/'+ id).map((response : Response) => {
                return response;
            });
        }

        clearCreditAmount(data){
            return this.http.post('/api/clearCreditAmount',data).map((response : Response) => {
                return response;
            });
        }
}