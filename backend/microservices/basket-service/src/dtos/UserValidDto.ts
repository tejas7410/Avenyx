export class UserValidDto {
    
    id:string;
    isAvailable:boolean;
  
    constructor(id:string,isAvailable:boolean) {
      this.id=id;
      this.isAvailable=isAvailable;     
    }
    
  }