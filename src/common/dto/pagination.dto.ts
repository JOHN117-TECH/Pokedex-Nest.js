
import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";

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

}