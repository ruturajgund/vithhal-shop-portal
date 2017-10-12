import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";
import { BillModelComponent } from './bill-model/bill-model.component'
import { BillService, AlertService, CustomerService } from '../../services/index'
import { Bill, Item, User, Customer } from '../../models/index'
import { Router } from '@angular/router'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'

@Component({
    templateUrl: 'bills.component.html',
    styleUrls: ['../dashboard.css']
})

export class BillsComponent implements OnInit{
    
    todaysAllBills: Bill[] = [];
    todaysTotalAmount: number;
    todaysTotalProductsSell: Item[] = [];
    tempTodaysTotalProductsSell: any[] = [];
    todaysPestisideProfit: number;
    todaysFertilizerProfit: number;
    todaysProfit: number;
    todaysPestisideBussiness: number;
    todaysFertilizerBussiness: number;
    todaysBussiness: number;
    message: string = null;
    currentUser: User;
    newCustomerFlag: boolean = false;
    newCustomer: Customer;

    constructor(
        private dialogService : DialogService,
        private billService : BillService,
        private router : Router,
        private alertService : AlertService,
        private customerService: CustomerService,
        private slimLoadingBarService : SlimLoadingBarService
    ){
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit(){
        this.todaysTotalProductsSell = [];
        this.todaysTotalAmount = 0;
        this.todaysPestisideBussiness = 0;
        this.todaysFertilizerBussiness = 0;
        this.todaysBussiness = 0;
        this.todaysPestisideProfit = 0;
        this.todaysFertilizerProfit = 0;
        this.todaysProfit = 0;
        this.slimLoadingBarService.start();
        this.billService.getTodayAllBills().subscribe(
            response =>{
                var data = response.json();
                this.todaysAllBills = data.bills;
                this.slimLoadingBarService.complete();
                this.todaysAllBills.forEach(bill => {
                    this.todaysTotalAmount += bill.totalAmount;
                    this.todaysPestisideProfit += bill.pesticideProfit;
                    this.todaysFertilizerProfit += bill.fertilizerProfit;
                    this.todaysProfit += bill.totalProfit;
                    this.todaysBussiness += bill.totalAmount;
                     bill.purchaseItems.forEach(item =>{
                         if(item.productType === "FERTILIZER"){
                             this.todaysFertilizerBussiness += item.subTotal;
                         }
                         else{
                             this.todaysPestisideBussiness += item.subTotal;
                         }
                        this.todaysTotalProductsSell.push(item);
                    });
                });
                var count = 1;
                for(var i=0; i< this.todaysTotalProductsSell.length; i++){
                    var product = this.todaysTotalProductsSell[i];
                    for(var j=count; j<this.todaysTotalProductsSell.length; j++){
                        if(this.todaysTotalProductsSell[i].productId === this.todaysTotalProductsSell[j].productId){
                            this.todaysTotalProductsSell[i].quantity += this.todaysTotalProductsSell[j].quantity;
                            this.todaysTotalProductsSell.splice(j, 1);
                        }
                    }
                    count++;
                }
            }
        )
    }

    newBill(){
        this.dialogService.addDialog(BillModelComponent, {
            billId: null,
            billDate: null,
            purchaseItems: null,
            totalAmount: null,
            totalQuantity: null,
            createdBy: null,
            createdDate: null,
            customerId: null,
            fertilizerProfit: null,
            pesticideProfit: null,
            totalProfit: null,
            amountPaid: null,
            amountCredit: null

        });
    }

    viewBillById(id){
        localStorage.setItem('billId', id);
        this.router.navigate(['/dashboard/bills/viewBill']);
    }

    refresh(){
        this.ngOnInit();
    }

    openCustomerPanel(){
        this.newCustomerFlag = true;
        this.newCustomer = new Customer();
    }

    closeCustomerPanel(){
        this.newCustomerFlag = false;
        this.newCustomer = new Customer();
    }

    createCustomer(){
        this.newCustomer.createdBy = this.currentUser.firstName + " " + this.currentUser.lastName;
        this.newCustomer.createdDate = new Date();
        this.newCustomer.amountCredit = 0;
        this.newCustomer.amountPaid = 0;
        this.newCustomer.totalAmount = 0;
        this.newCustomer.transactionHistory = [];
        this.slimLoadingBarService.start();
        this.customerService.createCustomer(this.newCustomer).subscribe(
            response => {
                var data = response.json();
                this.slimLoadingBarService.complete();
                if(data.status == 200){
                    this.alertService.success(data.message);
                    this.newCustomer = new Customer();
                }
                else{
                    this.alertService.error(data.message);
                }
            }
        );
    }

    closeCounter(){
        this.slimLoadingBarService.start();
        var todaysCounter:any = {
            counterDate : this.formatDate(new Date()),
            pesticideProfit: this.todaysPestisideProfit,
            fertilizerProfit: this.todaysFertilizerProfit,
            totalProfit: this.todaysProfit,
            pesticideBussiness : this.todaysPestisideBussiness,
            fertilizerBussiness: this.todaysFertilizerBussiness,
            totalBussiness : this.todaysBussiness,
            createdDate : new Date(),
            closedBy : this.currentUser.firstName + " " + this.currentUser.lastName
        }
        this.billService.closeCounter(todaysCounter).subscribe(
            response => {
                this.slimLoadingBarService.complete();
                var data = response.json();
                if(data.status == 200){
                    this.alertService.success(data.message);
                }
                else{
                    this.alertService.error(data.message);
                }
            }
        );
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        return [year, month, day].join('-');
    }
}