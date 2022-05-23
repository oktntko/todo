import { IsNotEmpty, IsPositive, IsString } from "class-validator";
import {
  Body,
  BodyParam,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  Put,
} from "routing-controllers";
import { CategoriesService } from "~/services/categories.service";

class CategoryBody {
  @IsNotEmpty()
  @IsString()
  category_name: string;
}

class PathParams {
  @IsPositive()
  category_id: number;
}

@JsonController()
export class CategoriesController {
  // # POST /api/categories
  @Post("/api/categories")
  async postCategory(@Body({ required: true }) category: CategoryBody) {
    return CategoriesService.postCategory(category);
  }

  // # GET /api/categories
  @Get("/api/categories")
  async getCategories() {
    return CategoriesService.getCategories();
  }

  // # GET /api/categories/:category_id
  @Get("/api/categories/:category_id")
  async getCategory(@Params() path: PathParams) {
    return CategoriesService.getCategory(path.category_id);
  }

  // # PUT /api/categories/:category_id
  @Put("/api/categories/:category_id")
  async putCategory(
    @Params({ required: true }) path: PathParams,
    @Body({ required: true }) category: CategoryBody,
    @BodyParam("updated_at", { required: true }) updated_at: Date
  ) {
    return CategoriesService.putCategory(path.category_id, category, updated_at);
  }

  // # DELETE /api/categories/:category_id
  @Delete("/api/categories/:category_id")
  async deleteCategory(
    @Params({ required: true }) path: PathParams,
    @BodyParam("updated_at", { required: true }) updated_at: Date
  ) {
    return CategoriesService.deleteCategory(path.category_id, updated_at);
  }
}
