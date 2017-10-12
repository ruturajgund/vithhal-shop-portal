import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class ActivitiesService{

    constructor(private http: Http) { }

    getRecentActivities(){
        return this.http.get('/api/getRecentActivities').map((response : Response) => {
            return response;
        });
    }

    getActivitiesByType(type){
        return this.http.get('/api/getRecentActivitiesByType/'+ type).map((response : Response) => {
            return response;
        });
    }

}