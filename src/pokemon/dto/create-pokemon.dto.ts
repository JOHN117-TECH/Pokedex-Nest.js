import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {

    @IsInt()
    @IsPositive()
    @Min(1)
    no: number;

    @IsString({ message: "Please enter a valid name 'name'" })
    @MinLength(1)
    name: string;


}
