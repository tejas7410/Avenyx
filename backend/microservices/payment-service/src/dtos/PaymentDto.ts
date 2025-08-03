export class PaymentDto {

    userId: string;
    products: string[];
    cardNo: string;
    totalAmount: number;

    constructor(userId:string, products: string[], cardNo: string, totalAmount:number) {
        this.userId = userId;
        this.products = products;
        this.cardNo = cardNo;
        this.totalAmount=totalAmount;
    }
}