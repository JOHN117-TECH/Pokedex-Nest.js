
import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class PaginationDto {
   
    @IsOptional()
    @IsPositive()
    @IsInt()
    @Min(1)
    @Transform(({ value }) => parseInt( value ) ) 
    limit?: number;
  
    @IsOptional()
    @IsPositive()
    @IsInt()
    @Transform(({ value }) => parseInt( value ) ) 
    offset?: number;

    @IsOptional()
    @IsString({ message: "Please enter a valid search 'value'" })
    search?:string;

}