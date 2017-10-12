import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService, BillService, AlertService } from '../../../services/index'
import { Bill, Customer } from '../../../models/index'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'

@Component({
  selector: 'app-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.css',
              '../../bills/view-bill/view-bill.component.css',
              '../../dashboard.css'           
            ]
})
export class ViewCustomerComponent implements OnInit {
  
  customerId: string;
  bill = new Bill();
  customer = new Customer();
  viewDetailsFlag: boolean = false;
  viewTransactionsFlag: boolean = false;
  viewBillsFlag: boolean = false;
  creditAmount: number= 0;

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private billService: BillService,
    private alertService: AlertService,
    private slimLoadingBarService : SlimLoadingBarService
  ) { 
    this.customerId = localStorage.getItem('customerId');
  }

  ngOnInit() {
    this.slimLoadingBarService.start();
    this.customerService.getCustomerById(this.customerId).subscribe(
      response => {
        var data = response.json();
        this.customer = data.customer;
        this.slimLoadingBarService.complete();
      }
    )
    this.viewDetails();
  }

  back(){
    localStorage.removeItem('customerId');
    this.router.navigate(['/dashboard/customers']);
  }

  viewDetails(){
    this.viewDetailsFlag = true;
    this.viewTransactionsFlag = false;
    this.viewBillsFlag = false;
  }

  viewTransactions(){
    this.viewDetailsFlag = false;
    this.viewTransactionsFlag = true;
    this.viewBillsFlag = false;
  }

  viewBill(billId){
    this.viewDetailsFlag = false;
    this.viewTransactionsFlag = false;
    this.viewBillsFlag = true;
    this.slimLoadingBarService.start();
    this.billService.getBillById(billId).subscribe(
      response => {
        var data = response.json();
        this.bill = data.bill;
        this.slimLoadingBarService.complete();
      }
    )
  }

  clearCreditAmount(){
    var data = {
      creditAmount: this.creditAmount,
      billId: this.bill.billId,
      customerId: this.bill.customerId
    };
    this.slimLoadingBarService.start();
    this.customerService.clearCreditAmount(data).subscribe(
      response => {
        var data = response.json();
        if(data.status == 200){
           this.alertService.success(data.message);
           this.creditAmount = 0;
        }
        else{
            this.alertService.error(data.message);
        }
        this.slimLoadingBarService.complete();
      })
  };

}
