import { Prisma, Tag } from "@prisma/client";
import ORM from "~/arch/ORM";
import dayjs from "~/libs/dayjs";
import {
  AlreadyExistsError,
  NotExistsError,
  UpdateConflictsError,
} from "~/middlewares/ErrorHandler";
import log from "~/middlewares/log";

const createTag = async (tag: Omit<Tag, "tag_id" | "created_at" | "updated_at">) => {
  log.debug("createTag");

  return ORM.tag.create({
    select: {
      tag_id: true,
      tag_name: true,
      icon: true,
      order: true,
      updated_at: true,
    },
    data: {
      tag_name: tag.tag_name,
      icon: tag.icon,
      order: tag.order,
    },
  });
};

const findManyTag = async (where?: Prisma.TagWhereInput) => {
  log.debug("findManyTag");

  return ORM.tag.findMany({
    select: {
      tag_id: true,
      tag_name: true,
      icon: true,
      order: true,
      updated_at: true,
    },
    where,
    orderBy: {
      order: "asc",
    },
  });
};

const findUniqueTag = async (where: RequireOne<Prisma.TagWhereUniqueInput>) => {
  log.debug("findUniqueTag");

  return ORM.tag.findUnique({
    select: {
      tag_id: true,
      tag_name: true,
      icon: true,
      order: true,
      updated_at: true,
    },
    where,
  });
};

const updateTag = async (
  where: RequireOne<Prisma.TagWhereUniqueInput>,
  tag: Omit<Tag, "tag_id" | "created_at" | "updated_at">
) => {
  log.debug("updateTag");

  return ORM.tag.update({
    select: {
      tag_id: true,
      tag_name: true,
      icon: true,
      order: true,
      updated_at: true,
    },
    data: {
      tag_name: tag.tag_name,
      icon: tag.icon,
      order: tag.order,
    },
    where,
  });
};

const deleteTag = async (where: RequireOne<Prisma.TagWhereUniqueInput>) => {
  log.debug("deleteTag");

  return ORM.tag.delete({
    select: {
      tag_id: true,
      tag_name: true,
      icon: true,
      order: true,
      updated_at: true,
    },
    where,
  });
};

const checkDuplicate = async (
  where: Pick<Required<Prisma.TagWhereUniqueInput>, "tag_name">,
  tag_id?: number
) => {
  const duplicate = await findUniqueTag(where);
  if (duplicate && (tag_id == null || duplicate.tag_id !== tag_id)) {
    throw new AlreadyExistsError();
  }

  return duplicate;
};

const checkPreviousVersion = async (
  where: Pick<Required<Prisma.TagWhereUniqueInput>, "tag_id">,
  updated_at: string
) => {
  const previous = await findUniqueTag(where);

  if (!previous) {
    throw new NotExistsError();
  } else if (!dayjs(previous.updated_at).isSame(updated_at)) {
    throw new UpdateConflictsError();
  }

  return previous;
};

const updateTagOrder = async (tag: Pick<Tag, "tag_id" | "order">) => {
  log.debug("updateTagOrder");

  return ORM.tag.update({
    select: {
      tag_id: true,
      tag_name: true,
      icon: true,
      order: true,
      updated_at: true,
    },
    data: {
      order: tag.order,
    },
    where: {
      tag_id: tag.tag_id,
    },
  });
};

export const TagsRepository = {
  createTag,
  findManyTag,
  findUniqueTag,
  updateTag,
  deleteTag,
  checkDuplicate,
  checkPreviousVersion,
  updateTagOrder,
} as const;
