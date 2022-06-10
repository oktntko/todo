import { Project } from "@prisma/client";
import log from "~/middlewares/log";
import { ProjectsRepository } from "~/repositories/projects.repository";

// # POST /api/projects
const postProject = async (project: Omit<Project, "project_id" | "created_at" | "updated_at">) => {
  log.debug("postProject", project);

  await ProjectsRepository.checkDuplicate({ project_name: project.project_name });

  return ProjectsRepository.createProject(project);
};

// # GET /api/projects
const getProjects = async () => {
  log.debug("getProjects");

  const projects = await ProjectsRepository.findManyProject();

  return { projects };
};

// # GET /api/projects/:project_id
const getProject = async (project_id: number) => {
  log.debug("getProject", project_id);

  return ProjectsRepository.findUniqueProject({ project_id });
};

// # PUT /api/projects/:project_id
const putProject = async (
  project_id: number,
  project: Omit<Project, "project_id" | "created_at" | "updated_at">,
  updated_at: string
) => {
  log.debug("putProject", project_id, project, updated_at);

  await ProjectsRepository.checkDuplicate({ project_name: project.project_name }, project_id);

  return ProjectsRepository.updateProject({ project_id }, project);
};

// # DELETE /api/projects/:project_id
const deleteProject = async (project_id: number, updated_at: string) => {
  log.debug("deleteProject", project_id, updated_at);

  return ProjectsRepository.deleteProject({ project_id });
};

// # PATCH /api/projects/reorder
const patchProjectReorder = async (projects: Pick<Project, "project_id" | "order">[]) => {
  log.debug("patchProjectReorder", projects);

  return { projects: await Promise.all(projects.map(ProjectsRepository.updateProjectOrder)) };
};

export const ProjectsService = {
  postProject,
  getProjects,
  getProject,
  putProject,
  deleteProject,
  patchProjectReorder,
} as const;
