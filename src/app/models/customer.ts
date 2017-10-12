import { Activity, Bill } from './index'

export class Customer{
    customerId: string;
    customerName: string;
    mobile: number;
    amountCredit: number;
    amountPaid: number;
    totalAmount: number;
    // activities: Activity[];
    transactionHistory: any[];
    createdDate: Date;
    createdBy: string;
}