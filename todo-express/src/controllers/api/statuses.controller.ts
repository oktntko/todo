import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsHexColor,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import {
  Body,
  BodyParam,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  Put,
  QueryParam,
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { StatusesService } from "~/services/statuses.service";

// ::: REQUEST
class StatusBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  status_name: string;

  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  @MaxLength(100)
  color: string;
}

class StatusPathParams {
  @IsPositive()
  status_id: number;
}

// ::: RESPONSE
class StatusResponse {
  @IsPositive()
  status_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  status_name: string;

  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  @MaxLength(100)
  color: string;

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;
}

class ListStatusResponse {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => StatusResponse)
  statuses: StatusResponse[];
}

@JsonController()
export class StatusesController {
  // # POST /api/statuses
  @Post("/api/statuses")
  @ResponseSchema(StatusResponse)
  async postStatus(@Body({ required: true }) status: StatusBody): Promise<StatusResponse> {
    return StatusesService.postStatus(status);
  }

  // # GET /api/statuses
  @Get("/api/statuses")
  @ResponseSchema(ListStatusResponse)
  async getStatuses(): Promise<ListStatusResponse> {
    return StatusesService.getStatuses();
  }

  // # GET /api/statuses/:status_id
  @Get("/api/statuses/:status_id")
  @ResponseSchema(StatusResponse)
  async getStatus(@Params() path: StatusPathParams): Promise<StatusResponse | null> {
    return StatusesService.getStatus(path.status_id);
  }

  // # PUT /api/statuses/:status_id
  @Put("/api/statuses/:status_id")
  @ResponseSchema(StatusResponse)
  async putStatus(
    @Params({ required: true }) path: StatusPathParams,
    @Body({ required: true }) status: StatusBody,
    @BodyParam("updated_at", { required: true }) updated_at: string
  ): Promise<StatusResponse> {
    return StatusesService.putStatus(path.status_id, status, updated_at);
  }

  // # DELETE /api/statuses/:status_id
  @Delete("/api/statuses/:status_id")
  @ResponseSchema(StatusResponse)
  async deleteStatus(
    @Params({ required: true }) path: StatusPathParams,
    @QueryParam("updated_at", { required: true }) updated_at: string
  ): Promise<StatusResponse> {
    return StatusesService.deleteStatus(path.status_id, updated_at);
  }
}
