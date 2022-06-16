import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { Get, JsonController, QueryParams } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { transformerEmptyToNull } from "~/libs/transformers";
import { DashboardService } from "~/services/dashboard.service";

// ::: REQUEST
export class DashboardQuery {
  // ! QueryParams で型を string | null にするとパースエラーが発生するため、 string? に統一する
  // エラーの内容は↓と同じ
  // https://github.com/typestack/routing-controllers/issues/748
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(transformerEmptyToNull)
  begin_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(transformerEmptyToNull)
  end_date?: string;
}

// ::: RESPONSE
export class CountResponse {
  @IsInt()
  count: number;
}

export class CountObjectResponse {
  @ValidateNested()
  @Type(() => CountResponse)
  created: CountResponse;

  @ValidateNested()
  @Type(() => CountResponse)
  done: CountResponse;
}

export class PieResponse {
  @IsOptional()
  @IsString()
  name?: string;

  @IsInt()
  count: number;
}

export class PieObjectResponse {
  @ValidateNested({ each: true })
  @Type(() => PieResponse)
  category: PieResponse[];

  @ValidateNested({ each: true })
  @Type(() => PieResponse)
  project: PieResponse[];
}

export class BarResponse {
  @IsString()
  created_date: string;
  @IsOptional()
  @IsString()
  name?: string;
  @IsInt()
  count: number;
}

export class BarObjectResponse {
  @ValidateNested({ each: true })
  @Type(() => BarResponse)
  category: BarResponse[];

  @ValidateNested({ each: true })
  @Type(() => BarResponse)
  project: BarResponse[];
}

export class DashboardResponse {
  @ValidateNested()
  @Type(() => CountObjectResponse)
  count: CountObjectResponse;

  @ValidateNested()
  @Type(() => PieObjectResponse)
  pie: PieObjectResponse;

  @ValidateNested()
  @Type(() => BarObjectResponse)
  stackedBar: BarObjectResponse;
}

@JsonController()
export class DashboardController {
  // # GET /api/dashboard
  @Get("/api/dashboard")
  @ResponseSchema(DashboardResponse)
  async getDashboard(
    @QueryParams({ required: false }) query: DashboardQuery
  ): Promise<DashboardResponse> {
    return DashboardService.getDashboard(query);
  }
}
