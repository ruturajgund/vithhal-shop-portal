import { Component, OnInit } from '@angular/core';
import { BillService, ProductService } from '../../services/index'
import { Product, User} from '../../models/index'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'

@Component({
    templateUrl: 'overview.component.html',
    styleUrls: ['./overview.component.css']
})

export class OverviewComponent implements OnInit{
    
    authenticationFlag: boolean = false;
    currentUser: User;
    allProducts: Product[] = [];
    fertilizerDetails: any = {
        ProductNames : [] ,
        ProductQuantity : []
    }
    pestisideDetails : any ={
        ProductNames : [] ,
        ProductQuantity : []
    }
    allCounterDetails : any[] = [];
    allCounterDate : any[] = [];
    pesticideBussiness : any[] = [];
    fertilizerBussiness : any[] = [];
    totalBussiness : any[] = [];
    pesticideProfit : any[] = [];
    fertilizerProfit : any[] = [];
    totalProfit : any[] = [];
    todaysDate = new Date();
    graphFlag: boolean = false;
    startDate: Date;
    endDate: Date;
    byRangeCounterDeatils: any = [];


    constructor(
        private billService: BillService,
        private productService: ProductService,
        private slimLoadingBarService : SlimLoadingBarService
    ){
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    }

    ngOnInit(){
        if(this.currentUser.role === "ADMIN"){ this.authenticationFlag = true;}
        this.slimLoadingBarService.start();
        // this.productService.getAllProducts().subscribe(
        //     response => {
        //         var data = response.json();
        //         this.allProducts = data.products;
        //         this.allProducts.forEach(product => {
        //             if(product.productType === "FERTILIZER"){
        //                 this.fertilizerDetails.ProductNames.push(product.productName);
        //                 this.fertilizerDetails.ProductQuantity.push(product.quantity);
        //             }
        //             else{
        //                 this.pestisideDetails.ProductNames.push(product.productName);
        //                 this.pestisideDetails.ProductQuantity.push(product.quantity);
        //             }
        //         });
        //     }
        // );
        this.billService.getAllCounterDetails().subscribe(
            response => {
                var data = response.json();
                this.allCounterDetails = data.counterDetails;
                this.allCounterDetails.forEach(counter => {
                    this.allCounterDate.push(counter.counterDate);
                    this.pesticideBussiness.push(counter.pesticideBussiness);
                    this.fertilizerBussiness.push(counter.fertilizerBussiness);
                    this.totalBussiness.push(counter.totalBussiness);
                    this.pesticideProfit.push(counter.pesticideProfit);
                    this.fertilizerProfit.push(counter.fertilizerProfit);
                    this.totalProfit.push(counter.totalProfit);
                });
                this.slimLoadingBarService.complete();
            }
        )
    }
    // lineChart
  public lineChartData1:Array<any> = [
      {label: 'Pestiside', data: this.pesticideBussiness},
      {label: 'Fertilizer', data: this.fertilizerBussiness},
      {label: 'Bussniess', data: this.totalBussiness}
    ];

    public lineChartData2:Array<any> = [
        {label: 'Pestiside', data: this.pesticideProfit},
        {label: 'Fertilizer', data: this.fertilizerProfit},
        {label: 'Bussniess', data: this.totalProfit}
        ];
    
  public lineChartLabels:Array<any> = this.allCounterDate;
  public lineChartType:string = 'line';
//   public pieChartType:string = 'doughnut';
 
//   // Pie
//   public pieChartLabels1:string[] = this.fertilizerDetails.ProductNames
//   public pieChartData1:number[] = this.fertilizerDetails.ProductQuantity;

//   public pieChartLabels2:string[] = this.pestisideDetails.ProductNames
//   public pieChartData2:number[] = this.pestisideDetails.ProductQuantity;
 
  public randomizeType():void {
    this.lineChartType = this.lineChartType === 'line' ? 'bar' : 'line';
    // this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
  }
 
  public chartClicked(e:any):void {
    // console.log(e);
  }
 
  public chartHovered(e:any):void {
    // console.log(e);
  }

  showGraph(){
    this.graphFlag = true;
  }

  getCounterDetailsByDateRange(){
      var range: any = {
          startDate: new Date(this.startDate),
          endDate: new Date(this.endDate)
      }
      this.byRangeCounterDeatils = [];
      this.slimLoadingBarService.start();
      this.billService.getCounterDetailsByDateRange(range).subscribe(
        response => {
            var data = response.json();
            this.byRangeCounterDeatils = data.counterDetails;
            this.slimLoadingBarService.complete();
        });
  }
}