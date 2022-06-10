import { Project, Prisma } from "@prisma/client";
import ORM from "~/arch/ORM";
import dayjs from "~/libs/dayjs";
import {
  AlreadyExistsError,
  NotExistsError,
  UpdateConflictsError,
} from "~/middlewares/ErrorHandler";
import log from "~/middlewares/log";

const createProject = async (
  project: Omit<Project, "project_id" | "created_at" | "updated_at">
) => {
  log.debug("createProject");

  return ORM.project.create({
    select: {
      project_id: true,
      project_name: true,
      icon: true,
      updated_at: true,
    },
    data: {
      project_name: project.project_name,
      icon: project.icon,
    },
  });
};

const findManyProject = async (where?: Prisma.ProjectWhereInput) => {
  log.debug("findManyProject");

  return ORM.project.findMany({
    select: {
      project_id: true,
      project_name: true,
      icon: true,
      updated_at: true,
    },
    where,
  });
};

const findUniqueProject = async (where: RequireOne<Prisma.ProjectWhereUniqueInput>) => {
  log.debug("findUniqueProject");

  return ORM.project.findUnique({
    select: {
      project_id: true,
      project_name: true,
      icon: true,
      updated_at: true,
    },
    where,
  });
};

const updateProject = async (
  where: RequireOne<Prisma.ProjectWhereUniqueInput>,
  project: Omit<Project, "project_id" | "created_at" | "updated_at">
) => {
  log.debug("updateProject");

  return ORM.project.update({
    select: {
      project_id: true,
      project_name: true,
      icon: true,
      updated_at: true,
    },
    data: {
      project_name: project.project_name,
      icon: project.icon,
    },
    where,
  });
};

const deleteProject = async (where: RequireOne<Prisma.ProjectWhereUniqueInput>) => {
  log.debug("deleteProject");

  return ORM.project.delete({
    select: {
      project_id: true,
      project_name: true,
      icon: true,
      updated_at: true,
    },
    where,
  });
};

const checkDuplicate = async (
  where: Pick<Required<Prisma.ProjectWhereUniqueInput>, "project_name">,
  project_id?: number
) => {
  const duplicate = await findUniqueProject(where);
  if (duplicate && (project_id == null || duplicate.project_id !== project_id)) {
    throw new AlreadyExistsError();
  }

  return duplicate;
};

const checkPreviousVersion = async (
  where: Pick<Required<Prisma.ProjectWhereUniqueInput>, "project_id">,
  updated_at: string
) => {
  const previous = await findUniqueProject(where);

  if (!previous) {
    throw new NotExistsError();
  } else if (!dayjs(previous.updated_at).isSame(updated_at)) {
    throw new UpdateConflictsError();
  }

  return previous;
};

export const ProjectsRepository = {
  createProject,
  findManyProject,
  findUniqueProject,
  updateProject,
  deleteProject,
  checkDuplicate,
  checkPreviousVersion,
} as const;
