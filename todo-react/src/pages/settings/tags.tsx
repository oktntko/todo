import equal from "fast-deep-equal";
import { Field, Form, Formik } from "formik";
import { motion, Reorder, useDragControls } from "framer-motion";
import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { AiFillTag } from "react-icons/ai";
import { BiSend, BiTrash, BiUndo } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/Button";
import { generateId } from "~/libs/strings";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

interface TagType extends Weaken<components["schemas"]["TagResponse"], "tag_id"> {
  tag_id: string | number;
}

const newdata = (index: number) => ({
  tag_id: generateId(), // 追加分は id が string
  tag_name: "",
  color: "#000000",
  order: index,
  updated_at: "",
});

export function TagIndexPage() {
  const { tags, setTags, postTags, putTags, deleteTags, patchTagReorder } = useTag();

  const handleReorder = (values: TagType[]) => {
    const tags = values.map((tag, index) => ({ ...tag, order: index }));
    setTags(values);

    if (tags.length) {
      patchTagReorder({
        tags: tags.filter(
          (tag) => typeof tag.tag_id === "number"
        ) as components["schemas"]["TagReorderBody"][],
      });
    }
  };

  const handleSubmit = (index: number, values: TagType) => {
    if (typeof values.tag_id === "string") {
      postTags(index, { ...values, order: index });
    } else {
      putTags(index, values.tag_id, { ...values, order: index });
    }
  };

  const handleDelete = (index: number, values: TagType) => {
    if (typeof values.tag_id === "number") {
      deleteTags(index, values.tag_id, values);
    }
  };

  const handleAdd = () => {
    setTags(update(tags, { $push: [newdata(tags.length)] }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto md:my-4 md:max-w-3xl md:px-4"
      >
        <Reorder.Group values={tags} onReorder={handleReorder} className=" ">
          {tags.map((tag, index) => (
            <TagRow
              key={tag.tag_id}
              index={index}
              tag={tag}
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
      </motion.div>
    </>
  );
}

const useTag = () => {
  const [tags, setTags] = useState<TagType[]>([]);

  const getTags = useCallback(() => {
    api.get.tags().then(({ data }) => setTags(data.tags));
  }, [tags]);

  useEffect(() => {
    getTags();
  }, []);

  const postTags = useCallback(
    (index: number, tag: components["schemas"]["TagBody"]) => {
      api.post.tags(tag).then(({ data }) => setTags(update(tags, { $splice: [[index, 1, data]] })));
    },
    [tags]
  );

  const putTags = useCallback(
    (index: number, tag_id: number, tag: components["schemas"]["TagBody"] & Version) => {
      api.put
        .tags({ tag_id: String(tag_id) }, tag)
        .then(({ data }) => setTags(update(tags, { $splice: [[index, 1, data]] })));
    },
    [tags]
  );

  const deleteTags = useCallback(
    (index: number, tag_id: number, version: Version) => {
      api.delete
        .tags({ tag_id: String(tag_id) }, version)
        .then(() => setTags(update(tags, { $splice: [[index, 1]] })));
    },
    [tags]
  );

  const patchTagReorder = useCallback(
    ({ tags }: components["schemas"]["ListTagBody"]) => {
      api.patch.tags({ tags });
    },
    [tags]
  );

  return {
    tags,
    setTags,
    getTags,
    postTags,
    putTags,
    deleteTags,
    patchTagReorder,
  };
};

type TagRowProps = {
  index: number;
  tag: TagType;
  onSubmit: (index: number, values: TagType) => void;
  onDelete: (index: number, values: TagType) => void;
};

function TagRow({ index, tag, onSubmit, onDelete }: TagRowProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={tag.tag_id}
      value={tag}
      dragListener={false}
      dragControls={dragControls}
      className="border-b"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Formik
          initialValues={tag}
          enableReinitialize
          onSubmit={(values) => onSubmit(index, values)}
        >
          {({ values, resetForm }) => {
            const isOriginalValues = equal(values, tag);

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
                    <label htmlFor={`color_${values.tag_id}`}>
                      <AiFillTag style={{ color: values.color }} />
                    </label>
                    <Field id={`color_${values.tag_id}`} type="color" name="color" />
                  </div>
                  <Field
                    type="text"
                    name="tag_name"
                    className="flex-grow truncate rounded border p-1"
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    className="rounded-3xl p-1"
                    colorset={"white"}
                    disabled={isOriginalValues}
                    onClick={() => {
                      resetForm({ values: tag });
                    }}
                  >
                    <BiUndo className="text-lg" />
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-3xl p-1"
                    colorset={"green"}
                    disabled={isOriginalValues || values.tag_name === ""}
                  >
                    <BiSend className="text-lg" />
                  </Button>
                  <Button
                    type="button"
                    className="rounded-3xl p-1"
                    colorset={"yellow"}
                    disabled={typeof values.tag_id === "string"}
                    onClick={() => {
                      onDelete(index, values);
                    }}
                  >
                    <BiTrash className="text-lg" />
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </motion.div>
    </Reorder.Item>
  );
}
