import { Component, OnInit } from '@angular/core';
import { Product, ProductType } from '../../../models/index'
import { ProductService, PaginationService } from '../../../services/index'
import * as _ from 'underscore'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar'

@Component({
    selector: 'products-stock',
    templateUrl: 'productsStock.component.html',
    styleUrls: ['../../dashboard.css']
})

export class ProductsStockComponent implements OnInit {

    allProducts: Product[] = [];
    productsOnPage: Product[] = [];
    search: string;
    pager: any = {};
    pagedItems: Product[];
    paginationFlag: boolean = true;

    constructor(
        private productService: ProductService,
        private slimLoadingBarService: SlimLoadingBarService,
        private paginationService: PaginationService
    ) { }

    ngOnInit() {
        this.slimLoadingBarService.start();
        this.productService.getAllProducts().subscribe(
            response => {
                var data = response.json();
                this.allProducts = data.products;
                this.setPage(1);
                this.slimLoadingBarService.complete();
            }
        );
    }

    searchByProduct(search) {
        
        if(search.length != 0){
            this.pagedItems = [];
            this.paginationFlag = false;
            this.allProducts.forEach(product => {
                if (product.productName.match(search)) {
                    this.pagedItems.push(product);
                }
            });
          }
          else{
            this.paginationFlag = true;
            this.pagedItems = [];
            this.setPage(1);
          }
    }

    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
          return;
        }
    
        // get pager object from service
        this.pager = this.paginationService.getPager(this.allProducts.length, page);
    
        // get current page of items
        this.pagedItems = this.allProducts.slice(this.pager.startIndex, this.pager.endIndex + 1);
      }
}