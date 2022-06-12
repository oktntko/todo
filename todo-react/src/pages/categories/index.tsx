import equal from "fast-deep-equal";
import { Field, Form, Formik } from "formik";
import { motion, Reorder, useDragControls } from "framer-motion";
import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { BiSend, BiTrash, BiUndo } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { MdCategory, MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/Button";
import { generateId } from "~/libs/strings";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

interface CategoryType extends Weaken<components["schemas"]["CategoryResponse"], "category_id"> {
  category_id: string | number;
}

const newdata = (index: number) => ({
  category_id: generateId(), // 追加分は id が string
  category_name: "",
  color: "#000000",
  order: index,
  updated_at: "",
});

export function CategoryIndexPage() {
  const {
    categories,
    setCategories,
    postCategories,
    putCategories,
    deleteCategories,
    patchCategoryReorder,
  } = useCategory();

  const handleReorder = (values: CategoryType[]) => {
    const categories = values.map((category, index) => ({ ...category, order: index }));
    setCategories(values);

    if (categories.length) {
      patchCategoryReorder({
        categories: categories.filter(
          (category) => typeof category.category_id === "number"
        ) as components["schemas"]["CategoryReorderBody"][],
      });
    }
  };

  const handleSubmit = (index: number, values: CategoryType) => {
    if (typeof values.category_id === "string") {
      postCategories(index, { ...values, order: index });
    } else {
      putCategories(index, values.category_id, { ...values, order: index });
    }
  };

  const handleDelete = (index: number, values: CategoryType) => {
    if (typeof values.category_id === "number") {
      deleteCategories(index, values.category_id, values);
    }
  };

  const handleAdd = () => {
    setCategories(update(categories, { $push: [newdata(categories.length)] }));
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container mx-auto sm:px-4 md:my-4 md:max-w-3xl">
          <Reorder.Group values={categories} onReorder={handleReorder} className=" ">
            {categories.map((category, index) => (
              <CategoryRow
                key={category.category_id}
                index={index}
                category={category}
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

const useCategory = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);

  const getCategories = useCallback(() => {
    api.get.categories().then(({ data }) => setCategories(data.categories));
  }, [categories]);

  useEffect(() => {
    getCategories();
  }, []);

  const postCategories = useCallback(
    (index: number, category: components["schemas"]["CategoryBody"]) => {
      api.post
        .categories(category)
        .then(({ data }) => setCategories(update(categories, { $splice: [[index, 1, data]] })));
    },
    [categories]
  );

  const putCategories = useCallback(
    (
      index: number,
      category_id: number,
      category: components["schemas"]["CategoryBody"] & Version
    ) => {
      api.put
        .categories({ category_id: String(category_id) }, category)
        .then(({ data }) => setCategories(update(categories, { $splice: [[index, 1, data]] })));
    },
    [categories]
  );

  const deleteCategories = useCallback(
    (index: number, category_id: number, version: Version) => {
      api.delete
        .categories({ category_id: String(category_id) }, version)
        .then(() => setCategories(update(categories, { $splice: [[index, 1]] })));
    },
    [categories]
  );

  const patchCategoryReorder = useCallback(
    ({ categories }: components["schemas"]["ListCategoryBody"]) => {
      api.patch.categories({ categories });
    },
    [categories]
  );

  return {
    categories,
    setCategories,
    getCategories,
    postCategories,
    putCategories,
    deleteCategories,
    patchCategoryReorder,
  };
};

type CategoryRowProps = {
  index: number;
  category: CategoryType;
  onSubmit: (index: number, values: CategoryType) => void;
  onDelete: (index: number, values: CategoryType) => void;
};

function CategoryRow({ index, category, onSubmit, onDelete }: CategoryRowProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={category.category_id}
      value={category}
      dragListener={false}
      dragControls={dragControls}
      className="border-b"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Formik
          initialValues={category}
          enableReinitialize
          onSubmit={(values) => onSubmit(index, values)}
        >
          {({ values, resetForm }) => {
            const isOriginalValues = equal(values, category);

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
                    <label htmlFor={`color_${values.category_id}`}>
                      <MdCategory style={{ color: values.color }} />
                    </label>
                    <Field id={`color_${values.category_id}`} type="color" name="color" />
                  </div>
                  <Field
                    type="text"
                    name="category_name"
                    className="flex-grow truncate rounded border p-1"
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    className="rounded-3xl p-1"
                    colorset={"white"}
                    disabled={isOriginalValues}
                    onClick={() => {
                      resetForm({ values: category });
                    }}
                  >
                    <BiUndo className="text-lg" />
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-3xl p-1"
                    colorset={"green"}
                    disabled={isOriginalValues || values.category_name === ""}
                  >
                    <BiSend className="text-lg" />
                  </Button>
                  <Button
                    type="button"
                    className="rounded-3xl p-1"
                    colorset={"yellow"}
                    disabled={typeof values.category_id === "string"}
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
