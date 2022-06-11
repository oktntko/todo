import { IsIn, IsNotEmpty, IsPositive } from "class-validator";
import { Response } from "express";
import { Controller, Get, Params, Res } from "routing-controllers";
import { DataNameType, FilesRepository, ResourcesType } from "~/repositories/files.repository";

class FilePathParams {
  @IsNotEmpty()
  @IsIn(["projects"])
  resources: string;

  @IsNotEmpty()
  @IsIn(["icon"])
  data_name: string;

  @IsPositive()
  id: number;
}

@Controller()
export class FilesController {
  @Get("/files/:resources/:data_name/:id")
  async getFile(@Params() path: FilePathParams, @Res() res: Response) {
    const repo = new FilesRepository(
      path.resources as ResourcesType,
      path.data_name as DataNameType
    );

    return res.send(await repo.read(path.id));
  }
}
