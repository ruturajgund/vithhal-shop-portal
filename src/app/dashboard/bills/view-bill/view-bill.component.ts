import { Component, OnInit } from '@angular/core';
import { BillService } from '../../../services/index'
import { Bill } from '../../../models/index'
import { Router } from '@angular/router';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

@Component({
  templateUrl: './view-bill.component.html',
  styleUrls: ['./view-bill.component.css', '../../dashboard.css']
})
export class ViewBillComponent implements OnInit {

  bill = new Bill();
  billId: number;
  totalQuantity: number = 0;
  totalAmount: number = 0;

  constructor(
    private billService : BillService,
    private router : Router,
    private slimLoadingBarService : SlimLoadingBarService
  ) {
    this.billId = JSON.parse(localStorage.getItem('billId'));
   }

  ngOnInit() {
    this.slimLoadingBarService.start();
    this.billService.getBillById(this.billId).subscribe(
      response => {
        var data = response.json();
        this.bill = data.bill;
        this.bill.purchaseItems.forEach(item =>{
            this.totalAmount += item.subTotal;
            this.totalQuantity += item.quantity;
        });
        this.slimLoadingBarService.complete();
      }
    )
  }

  back(){
    localStorage.removeItem('billId');
    this.router.navigate(['/dashboard/bills']);
  }

}
