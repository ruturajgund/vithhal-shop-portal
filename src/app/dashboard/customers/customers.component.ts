import { Component, OnInit } from '@angular/core';
import { Customer, User } from '../../models/index';
import { BillService, AlertService, CustomerService, PaginationService } from '../../services/index'
import { Router } from '@angular/router'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css', '../dashboard.css']
})
export class CustomersComponent implements OnInit {

  search: string;
  allCustomers: Customer[];
  newCustomerFlag: boolean = false;
  newCustomer: Customer;
  currentUser: User;
  pager: any = {};
  pagedItems: Customer[];
  paginationFlag: boolean = true;

  constructor(
    private billService: BillService,
    private alertService: AlertService,
    private customerService: CustomerService,
    private router: Router,
    private slimLoadingBarService: SlimLoadingBarService,
    private paginationService: PaginationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.slimLoadingBarService.start();
    this.customerService.getAllCustomers().subscribe(
      response => {
        var data = response.json();
        this.allCustomers = data.customers;
        this.setPage(1);
        this.slimLoadingBarService.complete();
      }
    );
  }


  searchByCustomerName(customerName) {
    if(customerName.length != 0){
      this.pagedItems = [];
      this.paginationFlag = false;
      this.allCustomers.forEach(customer => {
        if (customer.customerName.match(customerName)) {
          this.pagedItems.push(customer);
        }
      });
    }
    else{
      this.paginationFlag = true;
      this.pagedItems = [];
      this.setPage(1);
    }
  }

  viewCustomerDetails(index) {
    localStorage.setItem('customerId', this.pagedItems[index].customerId);
    this.router.navigate(['/dashboard/customers/viewcustomer']);
  }

  openCustomerPanel() {
    this.newCustomerFlag = true;
    this.newCustomer = new Customer();
  }

  closeCustomerPanel() {
    this.newCustomerFlag = false;
    this.newCustomer = new Customer();
  }

  createCustomer() {
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
        if (data.status == 200) {
          this.alertService.success(data.message);
          this.newCustomer = new Customer();
        }
        else {
          this.alertService.error(data.message);
        }
        this.slimLoadingBarService.complete();
      }
    );
  }

  refresh() {
    this.ngOnInit();
  }

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }

    // get pager object from service
    this.pager = this.paginationService.getPager(this.allCustomers.length, page);

    // get current page of items
    this.pagedItems = this.allCustomers.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }
}
