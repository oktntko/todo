import equal from "fast-deep-equal";
import { Field, Form, Formik } from "formik";
import { motion, Reorder, useDragControls } from "framer-motion";
import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { AiFillTag } from "react-icons/ai";
import { BiCheckCircle, BiTrash, BiUndo } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/Button";
import { Tooltip } from "~/components/Tooltip";
import { generateId } from "~/libs/strings";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

interface StatusType extends Weaken<components["schemas"]["StatusResponse"], "status_id"> {
  status_id: string | number;
}

const newdata = () => ({
  status_id: generateId(), // 追加分は id が string
  color: "#000000",
  status_name: "",
  updated_at: "",
});

export function StatusIndexPage() {
  const { statuses, setStatuses, postStatuses, putStatuses, deleteStatuses } = useStatus();

  const handleAdd = () => {
    setStatuses(update(statuses, { $push: [newdata()] }));
  };

  const handleSubmit = (index: number, values: StatusType) => {
    if (typeof values.status_id === "string") {
      postStatuses(index, values);
    } else {
      putStatuses(index, values.status_id, values);
    }
  };

  const handleDelete = (index: number, values: StatusType) => {
    if (typeof values.status_id === "number") {
      deleteStatuses(index, values.status_id, values);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container my-4 mx-auto sm:px-4 md:max-w-3xl">
          <Reorder.Group values={statuses} onReorder={setStatuses} className=" ">
            {statuses.map((status, index) => (
              <StatusRow
                key={status.status_id}
                index={index}
                status={status}
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

const useStatus = () => {
  const [statuses, setStatuses] = useState<StatusType[]>([]);

  const getStatuses = useCallback(() => {
    api.get.statuses().then(({ data }) => setStatuses(data.statuses));
  }, [statuses]);

  useEffect(() => {
    getStatuses();
  }, []);

  const postStatuses = useCallback(
    (index: number, status: components["schemas"]["StatusBody"]) => {
      api.post
        .statuses(status)
        .then(({ data }) => setStatuses(update(statuses, { $splice: [[index, 1, data]] })));
    },
    [statuses]
  );

  const putStatuses = useCallback(
    (index: number, status_id: number, status: components["schemas"]["StatusBody"] & Version) => {
      api.put
        .statuses({ status_id: String(status_id) }, status)
        .then(({ data }) => setStatuses(update(statuses, { $splice: [[index, 1, data]] })));
    },
    [statuses]
  );

  const deleteStatuses = useCallback(
    (index: number, status_id: number, version: Version) => {
      api.delete
        .statuses({ status_id: String(status_id) }, version)
        .then(() => setStatuses(update(statuses, { $splice: [[index, 1]] })));
    },
    [statuses]
  );

  return { statuses, setStatuses, getStatuses, postStatuses, putStatuses, deleteStatuses };
};

type StatusRowProps = {
  index: number;
  status: StatusType;
  onSubmit: (index: number, values: StatusType) => void;
  onDelete: (index: number, values: StatusType) => void;
};

function StatusRow({ index, status, onSubmit, onDelete }: StatusRowProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={status.status_id}
      value={status}
      dragListener={false}
      dragControls={dragControls}
      className="border-b"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Formik
          initialValues={status}
          enableReinitialize
          onSubmit={(values) => onSubmit(index, values)}
        >
          {({ values, resetForm }) => {
            const isOriginalValues = equal(values, status);

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
                  <div className="flex items-center space-x-2 rounded p-1">
                    <label htmlFor={`color_${status.status_id}`}>
                      <AiFillTag style={{ color: values.color }} />
                    </label>
                    <Field id={`color_${status.status_id}`} type="color" name="color" />
                  </div>
                  <Field
                    type="text"
                    name="status_name"
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
                        resetForm({ values: status });
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
                      disabled={isOriginalValues || values.status_name === ""}
                    >
                      <BiCheckCircle className="text-lg" />
                    </Button>
                  </Tooltip>

                  <Tooltip message="Delete">
                    <Button
                      type="button"
                      className="rounded-3xl p-1"
                      colorset={"yellow"}
                      disabled={typeof values.status_id === "string"}
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
