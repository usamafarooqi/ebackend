import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  name: string;
}
export class SigninDto{
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}