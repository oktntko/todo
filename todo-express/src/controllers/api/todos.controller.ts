import { IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";
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
} from "routing-controllers";
import { TodosService } from "~/services/todos.service";

class TodoBody {
  @IsNotEmpty()
  @IsString()
  yarukoto: string;

  @IsOptional()
  @IsPositive()
  category_id: number | null;

  @IsOptional()
  @IsString()
  kizitu: string | null;

  @IsOptional()
  @IsString()
  yusendo: string | null;

  @IsPositive({ each: true })
  subcategory_id_list: number[];

  @IsOptional()
  @IsString()
  memo: string | null;
}

class PathParams {
  @IsPositive()
  todo_id: number;
}

@JsonController()
export class TodosController {
  // # POST /api/todos
  @Post("/api/todos")
  async postTodo(@Body({ required: true }) todo: TodoBody) {
    return TodosService.postTodo(todo);
  }

  // # GET /api/todos
  @Get("/api/todos")
  async getTodos() {
    return TodosService.getTodos();
  }

  // # GET /api/todos/:todo_id
  @Get("/api/todos/:todo_id")
  async getTodo(@Params({ required: true }) path: PathParams) {
    return TodosService.getTodo(path.todo_id);
  }

  // # PUT /api/todos/:todo_id
  @Put("/api/todos/:todo_id")
  async putTodo(
    @Params({ required: true }) path: PathParams,
    @Body({ required: true }) todo: TodoBody,
    @BodyParam("updated_at", { required: true }) updated_at: Date
  ) {
    return TodosService.putTodo(path.todo_id, todo, updated_at);
  }

  // # DELETE /api/todos/:todo_id
  @Delete("/api/todos/:todo_id")
  async deleteTodo(
    @Params({ required: true }) path: PathParams,
    @BodyParam("updated_at", { required: true }) updated_at: Date
  ) {
    return TodosService.deleteTodo(path.todo_id, updated_at);
  }

  // # PATCH /api/todos/:todo_id/done
  @Patch("/api/todos/:todo_id/done")
  async patchTodo(
    @Params({ required: true }) path: PathParams,
    @BodyParam("updated_at", { required: true }) updated_at: Date
  ) {
    return TodosService.patchTodo(path.todo_id, updated_at);
  }
}
