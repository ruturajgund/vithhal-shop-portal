import { Item } from './index'

export class Bill{
    billId: number;
    billDate: string;
    customerId: string;
    purchaseItems: Item[];
    totalAmount: number;
    totalQuantity: number;
    pesticideProfit: number;
    fertilizerProfit: number;
    totalProfit: number;
    amountPaid: number;
    amountCredit : number;
    createdDate: Date;
    createdBy: string;
}