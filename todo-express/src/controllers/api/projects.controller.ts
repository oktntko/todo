import { Transform, Type } from "class-transformer";
import {
  IsDate,
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
  UploadedFile,
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { transformerStringToNumber } from "~/libs/transformers";
import { validateUploadedFile } from "~/libs/validators";
import { ProjectsService } from "~/services/projects.service";

// ::: REQUEST
class ProjectBody {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  project_name: string;

  @Transform(transformerStringToNumber) // form のため string で来るので変換する
  @IsInt()
  order: number;
}

class ProjectPathParams {
  @IsPositive()
  project_id: number;
}

class ProjectReorderBody {
  @IsPositive()
  project_id: number;

  @IsInt()
  order: number;
}

class ListProjectBody {
  @ValidateNested({ each: true })
  @Type(() => ProjectReorderBody)
  projects: ProjectReorderBody[];
}

// ::: RESPONSE
class ProjectResponse {
  @IsPositive()
  project_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  project_name: string;

  @IsInt()
  order: number;

  @IsNotEmpty()
  @IsDate()
  updated_at: Date;
}

class ListProjectResponse {
  @ValidateNested({ each: true })
  @Type(() => ProjectResponse)
  projects: ProjectResponse[];
}

@JsonController()
export class ProjectsController {
  // # POST /api/projects
  @Post("/api/projects")
  @ResponseSchema(ProjectResponse)
  async postProject(
    @Body({ required: true }) project: ProjectBody,
    @UploadedFile("icon", { required: false }) icon: Express.Multer.File | undefined
  ): Promise<ProjectResponse> {
    validateUploadedFile(icon, { required: false, mimetype: "image/", fileSize: 1024 * 1024 });

    return ProjectsService.postProject(project, icon);
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
    @BodyParam("updated_at", { required: true }) updated_at: string,
    @UploadedFile("icon", { required: false }) icon: Express.Multer.File | undefined
  ): Promise<ProjectResponse> {
    validateUploadedFile(icon, { required: false, mimetype: "image/", fileSize: 1024 * 1024 });

    return ProjectsService.putProject(path.project_id, project, updated_at, icon);
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

  // # PATCH /api/projects/reorder
  @Patch("/api/projects/reorder")
  @ResponseSchema(ListProjectResponse)
  async patchProjectReorder(
    @Body({ required: true }) body: ListProjectBody
  ): Promise<ListProjectResponse> {
    return ProjectsService.patchProjectReorder(body.projects);
  }
}
