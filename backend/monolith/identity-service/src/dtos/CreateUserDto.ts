// -> Created for sending new user infos to service(my business logic) from controller.

export class CreateUserDTO {
  name: string;
  surname: string;
  email: string;
  password: string;

  constructor(name: string, surname: string, password: string, email: string) {
    this.name = name;
    this.surname = surname;
    this.password = password;  
    this.email = email;      
  }
}
