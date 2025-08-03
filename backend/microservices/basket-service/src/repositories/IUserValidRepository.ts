import { UserValidDto } from "../dtos/UserValidDto";


export interface IUserValidRepository{
    
    getUserValid(key:string):Promise<boolean | null>;
    
    saveUserValid(userValid:UserValidDto,ttl:number):Promise<void>;
    
    deleteUserValid(key:string):Promise<void>
    
}