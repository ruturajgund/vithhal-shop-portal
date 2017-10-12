import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class BillService{
    
    constructor(private http: Http) { }

    getTodayAllBills(){
        return this.http.get('/api/getTodayAllBill').map((response : Response) => {
            return response;
        }); 
    }

    saveBill(bill){
        return this.http.post('/api/saveBill',bill).map((response : Response) => {
            return response;
        });
    }

    getBillById(billId){
        return this.http.get('/api/getBillById/'+ billId).map((response : Response) => {
            return response;
        });
    }

    closeCounter(todaysCounter){
        return this.http.post('api/closeCounter',todaysCounter).map((response : Response) => {
            return response;
        });
    }

    getAllCounterDetails(){
        return this.http.get('api/getAllCounterDetails').map((response : Response) => {
            return response;
        });
    }

    getCounterDetailsByDateRange(range){
        return this.http.post('api/getAllCounterDetailsByRange', range).map((response : Response) => {
            return response;
        });
    }

}