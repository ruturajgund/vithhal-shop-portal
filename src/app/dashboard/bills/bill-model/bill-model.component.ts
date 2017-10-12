import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Item, Bill} from '../../../models/index'
import { ProductService, BillService, CounterService, AlertService } from '../../../services/index'
import { Product, User } from '../../../models/index'
import * as _ from 'underscore';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

@Component({
    templateUrl: 'bill-model.component.html',
    styleUrls: ['../../dashboard.css'],
    providers: [
        Bill
    ]
})
export class BillModelComponent extends DialogComponent<Bill,string> implements OnInit{
    
    allProducts: Product[] = [];
    refinedProducts: Product[] = [];
    newProduct :any = {
        selectedProduct: null,
        quantity: 0,
        price: 0 
    };
    updateProducts: Product[] = [];
    currentBill: Bill;
    quantity: number;
    message: string;
    currentUser: User;
    selectedpProduct = new Product();
    
    constructor(
        dialogService : DialogService,
        private productService : ProductService,
        private billService: BillService,
        private counterService: CounterService,
        private alertService : AlertService,
        private slimLoadingBarService : SlimLoadingBarService

    ){
        super(dialogService);
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    
    ngOnInit(){
        this.currentBill = new Bill();
        this.productService.getAllProducts().subscribe(
            response => {
                var data = response.json();
                this.allProducts = data.products;
                this.refinedProducts = _.reject(this.allProducts, function(product){
                    return product.quantity == 0;
                });
            }
        );

        this.counterService.getBillCounter().subscribe(
            response => {
                var data = response.json();
                if(data.status === 200){
                    this.currentBill.billId = data.counter;
                }
            }
        );
        this.currentBill.billDate = this.formatDate(new Date());
        this.currentBill.purchaseItems = [];
        this.currentBill.totalAmount = 0;
        this.currentBill.totalQuantity = 0;
        this.currentBill.fertilizerProfit = 0;
        this.currentBill.pesticideProfit = 0;
        this.currentBill.totalProfit = 0;
        this.currentBill.createdBy = this.currentUser.firstName + " " + this.currentUser.lastName;
        this.currentBill.createdDate = new Date();
    }

    getSelectedProductDetails(){
        this.selectedpProduct = _.findWhere(this.allProducts,{_id:this.newProduct.selectedProduct});
    }

    addProductToBill(){
        var item = new Item();
        item.productId = this.selectedpProduct.productId;
        item.productName = this.selectedpProduct.productName;
        item.price = this.newProduct.price;
        item.quantity = this.newProduct.quantity;
        item.productType = this.selectedpProduct.productType
        item.subTotal = this.newProduct.quantity * this.newProduct.price;
        this.currentBill.totalAmount += item.subTotal;
        this.currentBill.totalQuantity += item.quantity;
        this.currentBill.purchaseItems.push(item);
        if(this.selectedpProduct.productType === "FERTILIZER"){
            this.currentBill.fertilizerProfit += (this.newProduct.price - this.selectedpProduct.buyPrice) * this.newProduct.quantity;
            this.currentBill.totalProfit += this.currentBill.fertilizerProfit;
            this.selectedpProduct = new Product();
            this.newProduct = new Item();
        }
        else{
            this.currentBill.pesticideProfit += (this.newProduct.price - this.selectedpProduct.buyPrice) * this.newProduct.quantity;
            this.currentBill.totalProfit += this.currentBill.pesticideProfit; 
            this.selectedpProduct = new Product();
            this.newProduct = new Item();
        }
    }

    saveBill(){
        this.slimLoadingBarService.start();
        this.currentBill.purchaseItems.forEach(purchaseProduct => {
            var product = _.find(this.allProducts,function(product){return product.productId === purchaseProduct.productId;})
            product.quantity = product.quantity - purchaseProduct.quantity;
            this.updateProducts.push(product);
        });

        var sendProducts = {
            update: this.updateProducts,
            save: []
        }

        this.billService.saveBill(this.currentBill).subscribe(
            response => {
                var data = response.json();
                if(data.status === 200){
                    this.message = data.message;
                    this.productService.saveProducts(sendProducts).subscribe(
                        response =>{
                            var data = response.json()
                            this.updateProducts = [];
                            this.slimLoadingBarService.complete();
                        }
                    );
                }
            }
        );
    }

    removeItem(index){
        this.currentBill.totalAmount = this.currentBill.totalAmount - this.currentBill.purchaseItems[index].subTotal;
        this.currentBill.totalQuantity = this.currentBill.totalQuantity - this.currentBill.purchaseItems[index].quantity;
        this.currentBill.purchaseItems.splice(index,1);
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

    checkStockQuantity(quantity){
        if(this.selectedpProduct.quantity < quantity){
            alert("For "+this.selectedpProduct.productName+"--"+ this.selectedpProduct.companyName +" we have "+ this.selectedpProduct.quantity + " left in stock.");
            this.newProduct.quantity = 0;
        }
    }

    checkPrice(price){
        if(this.selectedpProduct.buyPrice > price){
            alert("You are selling item less then buying price.");
            this.newProduct.price = 0;
        }
    }

}