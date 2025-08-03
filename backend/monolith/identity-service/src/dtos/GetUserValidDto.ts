export class GetUserValidDto {

    id:string
    isAvailable: boolean;

    constructor(id:string,isAvalabile: boolean) {
      this.id=id;
      this.isAvailable=isAvalabile;
    }
  }
  