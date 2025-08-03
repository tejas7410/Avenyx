// -> Created for sending user infos to client - 'user/profile' endpoint.

export class GetUserDetailsDto {
  id:string
  name: string;
  surname: string;
  email: string;

  constructor(id:string,name: string, surname: string, email: string) {
    this.id=id;
    this.name = name;
    this.surname = surname;
    this.email = email;
  }
}
