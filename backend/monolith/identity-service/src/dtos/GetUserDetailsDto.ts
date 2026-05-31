export class GetUserDetailsDto {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;

  constructor(
    id: string,
    name: string,
    surname: string,
    email: string,
    role: string
  ) {
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.email = email;
    this.role = role;
  }
}
