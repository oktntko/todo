import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsInt,
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
import { transformerEmptyToNull } from "~/libs/transformers";
import { TodosService } from "~/services/todos.service";

// ::: REQUEST
export class TodoBody {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  yarukoto?: string;

  @IsOptional()
  @Transform(transformerEmptyToNull)
  order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  beginning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  deadline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  memo?: string;

  @IsOptional()
  @IsPositive()
  @Transform(transformerEmptyToNull)
  status_id?: number;

  @IsOptional()
  @IsPositive()
  @Transform(transformerEmptyToNull)
  category_id?: number;

  @IsOptional()
  @IsPositive()
  @Transform(transformerEmptyToNull)
  project_id?: number;

  @IsPositive({ each: true })
  @IsArray()
  tag_id_list: number[];
}

class TodoPathParams {
  @IsPositive()
  todo_id: number;
}

class TodoReorderBody {
  @IsPositive()
  todo_id: number;

  @IsInt()
  order: number;
}

class ListTodoBody {
  @ValidateNested({ each: true })
  @Type(() => TodoReorderBody)
  todos: TodoReorderBody[];
}

// ::: RESPONSE
export class TodoResponse {
  @IsPositive()
  todo_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  yarukoto?: string;

  @IsOptional()
  @IsPositive()
  @Transform(transformerEmptyToNull)
  order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  beginning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  deadline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  memo?: string;

  @IsOptional()
  @IsPositive()
  @Transform(transformerEmptyToNull)
  status_id?: number;

  @IsOptional()
  @IsPositive()
  @Transform(transformerEmptyToNull)
  category_id?: number;

  @IsOptional()
  @IsPositive()
  @Transform(transformerEmptyToNull)
  project_id?: number;

  @IsPositive({ each: true })
  @IsArray()
  tag_id_list: number[];

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;

  @IsOptional()
  @IsDate()
  done_at?: Date;
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

  // # PATCH /api/todos/reorder
  @Patch("/api/todos/reorder")
  @ResponseSchema(ListTodoResponse)
  async patchTodoReorder(@Body({ required: true }) body: ListTodoBody): Promise<ListTodoResponse> {
    return TodosService.patchTodoReorder(body.todos);
  }

  // # PATCH /api/todos/:todo_id/done
  @Patch("/api/todos/:todo_id/done")
  @ResponseSchema(TodoResponse)
  async patchTodoDone(
    @Params({ required: true }) path: TodoPathParams,
    @BodyParam("updated_at", { required: true }) updated_at: string
  ): Promise<TodoResponse> {
    return TodosService.patchTodoDone(path.todo_id, updated_at);
  }

  // # PATCH /api/todos/:todo_id/status
  @Patch("/api/todos/:todo_id/status")
  @ResponseSchema(TodoResponse)
  async patchTodoStatus(
    @Params({ required: true }) path: TodoPathParams,
    @BodyParam("status_id", { required: true }) status_id: number
  ): Promise<TodoResponse> {
    return TodosService.patchTodoStatus(path.todo_id, status_id);
  }
}
