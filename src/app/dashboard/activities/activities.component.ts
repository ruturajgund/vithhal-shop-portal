import { Component, OnInit } from '@angular/core';
import { ActivitiesService } from '../../services/index'
import { Activity } from '../../models/index'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'

@Component({
  templateUrl: './activities.component.html',
  styleUrls: ['../dashboard.css','activities.component.css']
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  activityType: any[] = [
    {'type': 'PRODUCT'},
    {'type': 'COUNTERREPORT'}
    
  ];
  type: string;

  constructor(
    private activitiesService: ActivitiesService,
    private slimLoadingBarService : SlimLoadingBarService
  ) { }

  ngOnInit() {
    this.activities = [];
    this.slimLoadingBarService.start();
    this.activitiesService.getRecentActivities().subscribe(
      response => {
        var data  = response.json();
        this.activities = data.activities;
        this.slimLoadingBarService.complete();
      }
    )
  }

  getActivitiesByType(){
    this.activities = [];
    this.activitiesService.getActivitiesByType(this.type).subscribe(
      response => {
        var data  = response.json();
        this.activities = data.activities;
        this.slimLoadingBarService.complete();
      }
    )
  }

}
