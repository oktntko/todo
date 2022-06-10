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
import { TagsService } from "~/services/tags.service";

// ::: REQUEST
class TagBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tag_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  icon: string;
}

class TagPathParams {
  @IsPositive()
  tag_id: number;
}

// ::: RESPONSE
class TagResponse {
  @IsPositive()
  tag_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tag_name: string;

  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  @MaxLength(100)
  icon: string;

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;
}

class ListTagResponse {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TagResponse)
  tags: TagResponse[];
}

@JsonController()
export class TagsController {
  // # POST /api/tags
  @Post("/api/tags")
  @ResponseSchema(TagResponse)
  async postTag(@Body({ required: true }) tag: TagBody): Promise<TagResponse> {
    return TagsService.postTag(tag);
  }

  // # GET /api/tags
  @Get("/api/tags")
  @ResponseSchema(ListTagResponse)
  async getTags(): Promise<ListTagResponse> {
    return TagsService.getTags();
  }

  // # GET /api/tags/:tag_id
  @Get("/api/tags/:tag_id")
  @ResponseSchema(TagResponse)
  async getTag(@Params() path: TagPathParams): Promise<TagResponse | null> {
    return TagsService.getTag(path.tag_id);
  }

  // # PUT /api/tags/:tag_id
  @Put("/api/tags/:tag_id")
  @ResponseSchema(TagResponse)
  async putTag(
    @Params({ required: true }) path: TagPathParams,
    @Body({ required: true }) tag: TagBody,
    @BodyParam("updated_at", { required: true }) updated_at: string
  ): Promise<TagResponse> {
    return TagsService.putTag(path.tag_id, tag, updated_at);
  }

  // # DELETE /api/tags/:tag_id
  @Delete("/api/tags/:tag_id")
  @ResponseSchema(TagResponse)
  async deleteTag(
    @Params({ required: true }) path: TagPathParams,
    @QueryParam("updated_at", { required: true }) updated_at: string
  ): Promise<TagResponse> {
    return TagsService.deleteTag(path.tag_id, updated_at);
  }
}
