import { IsOptional, IsString, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';

export class UpdatePreferenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  district?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  @MaxLength(100, { each: true })
  interests?: string[];
}
