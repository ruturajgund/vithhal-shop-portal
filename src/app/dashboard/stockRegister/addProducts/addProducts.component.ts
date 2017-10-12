import { Component, OnInit } from '@angular/core';
import { Product, ProductType, Company, User } from '../../../models/index'
import { ProductService, CompanyService, AlertService } from '../../../services/index'
import * as _ from 'underscore';
import { Router } from '@angular/router'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'


@Component({
    selector: 'add-products',
    templateUrl: 'addProducts.component.html',
    styleUrls: ['../../dashboard.css']
})

export class AddProductsComponent implements OnInit{
    newProduct = new Product();
    products: Product[] = [];
    allProducts: Product[] = [];
    updateProducts: Product[] = [];
    message: string = "";
    productTypes: ProductType[] = [
        {
        'type': 'FERTILIZER'
        },
        {
        'type': 'PESTICIDES'
        }
    ];
    companyPanelFlag: boolean = false;
    newCompany = new Company();
    companies: Company[] = [];
    currentUser: User;

    constructor(
        private productService : ProductService,
        private router : Router,
        private companyService: CompanyService,
        private alertService : AlertService,
        private slimLoadingBarService : SlimLoadingBarService
    ){
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit(){
        this.getAllProducts();
    }

    getAllProducts(){
        this.slimLoadingBarService.start();
        this.productService.getAllProducts().subscribe(
            response => {
                var data = response.json();
                this.allProducts = data.products;
                this.slimLoadingBarService.complete();
            }
        ); 
    }

    addProduct(){
        if(this.newProduct){
            this.newProduct.modifiedDate = new Date();
            this.newProduct.modifiedBy = this.currentUser.firstName + " " + this.currentUser.lastName;
            this.products.push(this.newProduct);
            this.newProduct = new Product();
        }
    }

    saveProducts(){
        this.slimLoadingBarService.start();
        var tempProducts = this.products;
        this.products.forEach(product1 => {
            this.allProducts.forEach(product2 =>{
                if(product1.productName === product2.productName && product1.productType === product2.productType && product1.companyName === product2.companyName){
                    product2.quantity += product1.quantity;
                    var tempProduct = product2;
                    this.updateProducts.push(tempProduct);
                    var removeProduct = _.findWhere(this.products,{productName: product1.productName,productType: product1.productType, companyName: product1.companyName});
                    tempProducts.splice(_.indexOf(this.products,removeProduct), 1);
                }
            });
        });
        this.products = tempProducts;
        var sendProducts = {
            update: this.updateProducts,
            save:   this.products
        }
        this.productService.saveProducts(sendProducts).subscribe(
            response =>{
                var data = response.json()
                if(data.status == 200){
                    this.alertService.success(data.message);
                }
                else{
                    this.alertService.error(data.message);
                }
                this.products = [];
                this.updateProducts = [];
                tempProducts = [];
                this.slimLoadingBarService.complete();
            }
        );  
        this.allProducts = [];     
        this.getAllProducts();
    }

    removeProduct(index){
        this.products.splice(index, 1);
    }

    openCompanyPanel(){
        this.companyPanelFlag = true;
    }

    closeCompanyPanel(){
        this.companyPanelFlag = false;
        this.newCompany = new Company();
    }

    saveCompany(){
        this.slimLoadingBarService.start();
        this.companyService.saveCompany(this.newCompany).subscribe(
            response =>{
                var data = response.json();
                if(data.status == 200){
                    this.alertService.success(data.message);
                }
                else{
                    this.alertService.error(data.message);
                }
                this.newCompany = new Company();
                this.slimLoadingBarService.complete();
            }
        );
    }

    getCompanies(){
        this.slimLoadingBarService.start();
        this.companyService.getCompanies().subscribe(
            response => {
                var data = response.json();
                this.companies = data.companies;
                this.slimLoadingBarService.complete();
            }
        )
    }
    
}