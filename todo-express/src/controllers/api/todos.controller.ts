import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
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
import { TodosService } from "~/services/todos.service";

// ::: REQUEST
export class TodoBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  yarukoto: string;

  @IsOptional()
  @IsPositive()
  category_id: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  kizitu: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  yusendo: string | null;

  @IsPositive({ each: true })
  subcategory_id_list: number[];

  @IsOptional()
  @IsString()
  @MaxLength(400)
  memo: string | null;
}

class TodoPathParams {
  @IsPositive()
  todo_id: number;
}

// ::: RESPONSE
export class TodoResponse {
  @IsPositive()
  todo_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  yarukoto: string;

  @IsOptional()
  @IsPositive()
  category_id: number | null;

  @ValidateNested()
  @IsOptional()
  @Type(() => Category)
  category: Category | null;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  kizitu: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  yusendo: string | null;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Category)
  subcategories: Category[];

  @IsOptional()
  @IsString()
  @MaxLength(400)
  memo: string | null;

  @IsBoolean()
  is_done: boolean;

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;
}

class Category {
  @IsPositive()
  category_id: number;
  @IsString()
  @MaxLength(100)
  category_name: string;
}

class ListTodoResponse {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TodoResponse)
  todos: TodoResponse[];
}

@JsonController()
export class TodosController {
  // # POST /api/todos
  @Post("/api/todos")
  @ResponseSchema(TodoResponse)
  async postTodo(@Body({ required: true }) todo: TodoBody): Promise<TodoResponse> {
    return TodosService.postTodo(todo);
  }

  // # GET /api/todos
  @Get("/api/todos")
  @ResponseSchema(ListTodoResponse)
  async getTodos(): Promise<ListTodoResponse> {
    return TodosService.getTodos();
  }

  // # GET /api/todos/:todo_id
  @Get("/api/todos/:todo_id")
  @ResponseSchema(TodoResponse)
  async getTodo(@Params({ required: true }) path: TodoPathParams): Promise<TodoResponse | null> {
    return TodosService.getTodo(path.todo_id);
  }

  // # PUT /api/todos/:todo_id
  @Put("/api/todos/:todo_id")
  @ResponseSchema(TodoResponse)
  async putTodo(
    @Params({ required: true }) path: TodoPathParams,
    @Body({ required: true }) todo: TodoBody,
    @BodyParam("updated_at", { required: true }) updated_at: string
  ): Promise<TodoResponse> {
    return TodosService.putTodo(path.todo_id, todo, updated_at);
  }

  // # DELETE /api/todos/:todo_id
  @Delete("/api/todos/:todo_id")
  @ResponseSchema(TodoResponse)
  async deleteTodo(
    @Params({ required: true }) path: TodoPathParams,
    @QueryParam("updated_at", { required: true }) updated_at: string
  ): Promise<TodoResponse> {
    return TodosService.deleteTodo(path.todo_id, updated_at);
  }

  // # PATCH /api/todos/:todo_id/done
  @Patch("/api/todos/:todo_id/done")
  @ResponseSchema(TodoResponse)
  async patchTodo(
    @Params({ required: true }) path: TodoPathParams,
    @BodyParam("updated_at", { required: true }) updated_at: string
  ): Promise<TodoResponse> {
    return TodosService.patchTodo(path.todo_id, updated_at);
  }
}
