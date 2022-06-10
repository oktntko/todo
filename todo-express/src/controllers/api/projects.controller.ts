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
import { ProjectsService } from "~/services/projects.service";

// ::: REQUEST
class ProjectBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  project_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  icon: string;
}

class ProjectPathParams {
  @IsPositive()
  project_id: number;
}

// ::: RESPONSE
class ProjectResponse {
  @IsPositive()
  project_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  project_name: string;

  @IsNotEmpty()
  @IsString()
  @IsHexColor()
  @MaxLength(100)
  icon: string;

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;
}

class ListProjectResponse {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ProjectResponse)
  projects: ProjectResponse[];
}

@JsonController()
export class ProjectsController {
  // # POST /api/projects
  @Post("/api/projects")
  @ResponseSchema(ProjectResponse)
  async postProject(@Body({ required: true }) project: ProjectBody): Promise<ProjectResponse> {
    return ProjectsService.postProject(project);
  }

  // # GET /api/projects
  @Get("/api/projects")
  @ResponseSchema(ListProjectResponse)
  async getProjects(): Promise<ListProjectResponse> {
    return ProjectsService.getProjects();
  }

  // # GET /api/projects/:project_id
  @Get("/api/projects/:project_id")
  @ResponseSchema(ProjectResponse)
  async getProject(@Params() path: ProjectPathParams): Promise<ProjectResponse | null> {
    return ProjectsService.getProject(path.project_id);
  }

  // # PUT /api/projects/:project_id
  @Put("/api/projects/:project_id")
  @ResponseSchema(ProjectResponse)
  async putProject(
    @Params({ required: true }) path: ProjectPathParams,
    @Body({ required: true }) project: ProjectBody,
    @BodyParam("updated_at", { required: true }) updated_at: string
  ): Promise<ProjectResponse> {
    return ProjectsService.putProject(path.project_id, project, updated_at);
  }

  // # DELETE /api/projects/:project_id
  @Delete("/api/projects/:project_id")
  @ResponseSchema(ProjectResponse)
  async deleteProject(
    @Params({ required: true }) path: ProjectPathParams,
    @QueryParam("updated_at", { required: true }) updated_at: string
  ): Promise<ProjectResponse> {
    return ProjectsService.deleteProject(path.project_id, updated_at);
  }
}
