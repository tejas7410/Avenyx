export class PaymentRequest {

    userId: string;
    products: string[];
    cardNo: string;

    constructor(userId:string, products: string[], cardNo: string) {
        this.userId = userId;
        this.products = products;
        this.cardNo = cardNo;
    }
}