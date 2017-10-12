import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

// Imports commented out for brevity
import { RouterModule } from '@angular/router';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ChartsModule } from 'ng2-charts';
// import { MomentModule } from 'angular2-moment/moment.module';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountComponent } from './dashboard/account/account.component';
import { OverviewComponent } from './dashboard/overview/overview.component';
import { StockRegisterComponent } from './dashboard/stockRegister/stockRegister.component';
import { AddProductsComponent } from './dashboard/stockRegister/addProducts/addProducts.component';
import { ProductsStockComponent } from './dashboard/stockRegister/productsStock/productsStock.component';
import { BillsComponent } from './dashboard/bills/bills.component';
import { BillModelComponent } from './dashboard/bills/bill-model/bill-model.component';
import {
  AuthenticationService, UserService, AlertService, ProductService, BillService,
  CounterService, CompanyService, ActivitiesService, CustomerService,
  PaginationService
} from './services/index';
import { ViewBillComponent } from './dashboard/bills/view-bill/view-bill.component';
import { AlertComponent } from './directives/alert/alert.component';
import { ActivitiesComponent } from './dashboard/activities/activities.component';
import { CustomersComponent } from './dashboard/customers/customers.component';
import { ViewCustomerComponent } from './dashboard/customers/view-customer/view-customer.component';
import { AuthGuard } from './guards/index';

// Define the routes
const ROUTES = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'accountDetails',
        component: AccountComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'overview',
        component: OverviewComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'stockRegister',
        component: StockRegisterComponent,
        children: [
          {
            path: '',
            redirectTo: 'productsStock',
            pathMatch: 'full'
          },
          {
            path: 'productsStock',
            component: ProductsStockComponent
          },
          {
            path: 'addproducts',
            component: AddProductsComponent
          }
        ]
      },
      {
        path: 'bills',
        component: BillsComponent
      },
      {
        path: 'bills/viewBill',
        component: ViewBillComponent
      },
      {
        path: 'activities',
        component: ActivitiesComponent
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'customers/viewcustomer',
        component: ViewCustomerComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    AccountComponent,
    OverviewComponent,
    StockRegisterComponent,
    AddProductsComponent,
    ProductsStockComponent,
    BillsComponent,
    BillModelComponent,
    ViewBillComponent,
    AlertComponent,
    ActivitiesComponent,
    CustomersComponent,
    ViewCustomerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES),
    BootstrapModalModule,
    ChartsModule,
    // MomentModule,
    SlimLoadingBarModule.forRoot()
  ],
  providers: [
    AuthenticationService,
    UserService,
    AlertService,
    ProductService,
    BillService,
    CounterService,
    CompanyService,
    ActivitiesService,
    CustomerService,
    AuthGuard,
    PaginationService
  ],
  entryComponents: [
    BillModelComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
