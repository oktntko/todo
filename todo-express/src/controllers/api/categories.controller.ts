import { Type } from "class-transformer";
import {
  IsDate,
  IsHexColor,
  IsInt,
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
  Patch,
  Post,
  Put,
  QueryParam,
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { CategoriesService } from "~/services/categories.service";

// ::: REQUEST
class CategoryBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category_name: string;

  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  @MaxLength(100)
  color: string;

  @IsInt()
  order: number;
}

class CategoryPathParams {
  @IsPositive()
  category_id: number;
}

class CategoryReorderBody {
  @IsPositive()
  category_id: number;

  @IsInt()
  order: number;
}

class ListCategoryBody {
  @ValidateNested({ each: true })
  @Type(() => CategoryReorderBody)
  categories: CategoryReorderBody[];
}

// ::: RESPONSE
class CategoryResponse {
  @IsPositive()
  category_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category_name: string;

  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  @MaxLength(100)
  color: string;

  @IsInt()
  order: number;

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;
}

class ListCategoryResponse {
  @ValidateNested({ each: true })
  @Type(() => CategoryResponse)
  categories: CategoryResponse[];
}

@JsonController()
export class CategoriesController {
  // # POST /api/categories
  @Post("/api/categories")
  @ResponseSchema(CategoryResponse)
  async postCategory(@Body({ required: true }) category: CategoryBody): Promise<CategoryResponse> {
    return CategoriesService.postCategory(category);
  }

  // # GET /api/categories
  @Get("/api/categories")
  @ResponseSchema(ListCategoryResponse)
  async getCategories(): Promise<ListCategoryResponse> {
    return CategoriesService.getCategories();
  }

  // # GET /api/categories/:category_id
  @Get("/api/categories/:category_id")
  @ResponseSchema(CategoryResponse)
  async getCategory(@Params() path: CategoryPathParams): Promise<CategoryResponse | null> {
    return CategoriesService.getCategory(path.category_id);
  }

  // # PUT /api/categories/:category_id
  @Put("/api/categories/:category_id")
  @ResponseSchema(CategoryResponse)
  async putCategory(
    @Params({ required: true }) path: CategoryPathParams,
    @Body({ required: true }) category: CategoryBody,
    @BodyParam("updated_at", { required: true }) updated_at: string
  ): Promise<CategoryResponse> {
    return CategoriesService.putCategory(path.category_id, category, updated_at);
  }

  // # DELETE /api/categories/:category_id
  @Delete("/api/categories/:category_id")
  @ResponseSchema(CategoryResponse)
  async deleteCategory(
    @Params({ required: true }) path: CategoryPathParams,
    @QueryParam("updated_at", { required: true }) updated_at: string
  ): Promise<CategoryResponse> {
    return CategoriesService.deleteCategory(path.category_id, updated_at);
  }

  // # PATCH /api/categories/reorder
  @Patch("/api/categories/reorder")
  @ResponseSchema(ListCategoryResponse)
  async patchStatusReorder(
    @Body({ required: true }) body: ListCategoryBody
  ): Promise<ListCategoryResponse> {
    return CategoriesService.patchCategoryReorder(body.categories);
  }
}
