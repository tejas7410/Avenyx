export class CreateUserDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: string;

  constructor(
    name: string,
    surname: string,
    password: string,
    email: string,
    role: string
  ) {
    this.name = name;
    this.surname = surname;
    this.password = password;
    this.email = email;
    this.role = role;
  }
}
