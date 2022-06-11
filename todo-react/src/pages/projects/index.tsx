import equal from "fast-deep-equal";
import { Field, FieldInputProps, Form, Formik } from "formik";
import { motion, Reorder, useDragControls } from "framer-motion";
import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { BiCheckCircle, BiTrash, BiUndo } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/Button";
import { ImageInput } from "~/components/Input";
import { Tooltip } from "~/components/Tooltip";
import { generateId } from "~/libs/strings";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

interface ProjectType extends Weaken<components["schemas"]["ProjectResponse"], "project_id"> {
  project_id: string | number;
  icon?: File | null;
}

const newdata = (index: number) => ({
  project_id: generateId(), // 追加分は id が string
  project_name: "",
  order: index,
  updated_at: "",
  icon: null as File | null,
});

export function ProjectIndexPage() {
  const { projects, setProjects, postProjects, putProjects, deleteProjects, patchProjectReorder } =
    useProject();

  const handleReorder = (values: ProjectType[]) => {
    const projects = values.map((project, index) => ({ ...project, order: index }));
    setProjects(values);

    if (projects.length) {
      patchProjectReorder({
        projects: projects.filter(
          (project) => typeof project.project_id === "number"
        ) as components["schemas"]["ProjectReorderBody"][],
      });
    }
  };

  const handleSubmit = (index: number, values: ProjectType) => {
    if (typeof values.project_id === "string") {
      postProjects(index, { ...values, order: index });
    } else {
      putProjects(index, values.project_id, { ...values, order: index });
    }
  };

  const handleDelete = (index: number, values: ProjectType) => {
    if (typeof values.project_id === "number") {
      deleteProjects(index, values.project_id, values);
    }
  };

  const handleAdd = () => {
    setProjects(update(projects, { $push: [newdata(projects.length)] }));
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container my-4 mx-auto sm:px-4 md:max-w-3xl">
          <Reorder.Group values={projects} onReorder={handleReorder} className=" ">
            {projects.map((project, index) => (
              <ProjectRow
                key={project.project_id}
                index={index}
                project={project}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
              />
            ))}
          </Reorder.Group>

          <div className="flex flex-row flex-nowrap items-center justify-start space-x-2 ">
            <Button
              type="button"
              className="flex flex-grow items-center space-x-2 rounded-none border-0 bg-neutral-100 p-2 hover:bg-slate-200"
              onClick={handleAdd}
            >
              <BsPlus />
              <span>追加</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

const useProject = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);

  const getProjects = useCallback(() => {
    api.get.projects().then(({ data }) => setProjects(data.projects));
  }, [projects]);

  useEffect(() => {
    getProjects();
  }, []);

  const postProjects = useCallback(
    (index: number, project: ProjectType) => {
      api.post
        .projects(project)
        .then(({ data }) => setProjects(update(projects, { $splice: [[index, 1, data]] })));
    },
    [projects]
  );

  const putProjects = useCallback(
    (index: number, project_id: number, project: ProjectType) => {
      api.put
        .projects({ project_id: String(project_id) }, project)
        .then(({ data }) => setProjects(update(projects, { $splice: [[index, 1, data]] })));
    },
    [projects]
  );

  const deleteProjects = useCallback(
    (index: number, project_id: number, version: Version) => {
      api.delete
        .projects({ project_id: String(project_id) }, version)
        .then(() => setProjects(update(projects, { $splice: [[index, 1]] })));
    },
    [projects]
  );

  const patchProjectReorder = useCallback(
    ({ projects }: components["schemas"]["ListProjectBody"]) => {
      api.patch.projects({ projects });
    },
    [projects]
  );

  return {
    projects,
    setProjects,
    getProjects,
    postProjects,
    putProjects,
    deleteProjects,
    patchProjectReorder,
  };
};

type ProjectRowProps = {
  index: number;
  project: ProjectType;
  onSubmit: (index: number, values: ProjectType) => void;
  onDelete: (index: number, values: ProjectType) => void;
};

function ProjectRow({ index, project, onSubmit, onDelete }: ProjectRowProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={project.project_id}
      value={project}
      dragListener={false}
      dragControls={dragControls}
      className="border-b"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Formik
          initialValues={project}
          enableReinitialize
          onSubmit={(values) => onSubmit(index, values)}
        >
          {({ values, resetForm }) => {
            const isOriginalValues = equal(values, project);

            return (
              <Form>
                <div
                  className={`flex flex-row flex-nowrap items-center justify-start
                  space-x-2 bg-neutral-100 p-2`}
                >
                  <Button
                    type="button"
                    className="cursor-move border-0"
                    onPointerDown={(event) => dragControls.start(event)}
                  >
                    <MdOutlineDragIndicator className="text-xl" />
                  </Button>
                  <Field name="icon" className="flex items-center space-x-2 rounded p-1 text-sm">
                    {({ field }: { field: FieldInputProps<File | null> }) => (
                      <ImageInput
                        {...field}
                        htmlId={`icon_${values.project_id}`}
                        dataId={values.project_id}
                      />
                    )}
                  </Field>
                  <Field
                    type="text"
                    name="project_name"
                    className="flex-grow truncate rounded border p-1"
                    maxLength={50}
                  />
                  <Tooltip message="Undo" className="uppercase">
                    <Button
                      type="button"
                      className="rounded-3xl p-1"
                      colorset={"white"}
                      disabled={isOriginalValues}
                      onClick={() => {
                        resetForm({ values: project });
                      }}
                    >
                      <BiUndo className="text-lg" />
                    </Button>
                  </Tooltip>
                  <Tooltip message="Commit">
                    <Button
                      type="submit"
                      className="rounded-3xl p-1"
                      colorset={"green"}
                      disabled={isOriginalValues || values.project_name === ""}
                    >
                      <BiCheckCircle className="text-lg" />
                    </Button>
                  </Tooltip>

                  <Tooltip message="Delete">
                    <Button
                      type="button"
                      className="rounded-3xl p-1"
                      colorset={"yellow"}
                      disabled={typeof values.project_id === "string"}
                      onClick={() => {
                        onDelete(index, values);
                      }}
                    >
                      <BiTrash className="text-lg" />
                    </Button>
                  </Tooltip>
                </div>
              </Form>
            );
          }}
        </Formik>
      </motion.div>
    </Reorder.Item>
  );
}
