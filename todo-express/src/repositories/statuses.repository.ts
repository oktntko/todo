import { Status, Prisma } from "@prisma/client";
import ORM from "~/arch/ORM";
import dayjs from "~/libs/dayjs";
import {
  AlreadyExistsError,
  NotExistsError,
  UpdateConflictsError,
} from "~/middlewares/ErrorHandler";
import log from "~/middlewares/log";

const createStatus = async (status: Omit<Status, "status_id" | "created_at" | "updated_at">) => {
  log.debug("createStatus");

  return ORM.status.create({
    select: {
      status_id: true,
      status_name: true,
      color: true,
      updated_at: true,
    },
    data: {
      status_name: status.status_name,
      color: status.color,
    },
  });
};

const findManyStatus = async (where?: Prisma.StatusWhereInput) => {
  log.debug("findManyStatus");

  return ORM.status.findMany({
    select: {
      status_id: true,
      status_name: true,
      color: true,
      updated_at: true,
    },
    where,
  });
};

const findUniqueStatus = async (where: RequireOne<Prisma.StatusWhereUniqueInput>) => {
  log.debug("findUniqueStatus");

  return ORM.status.findUnique({
    select: {
      status_id: true,
      status_name: true,
      color: true,
      updated_at: true,
    },
    where,
  });
};

const updateStatus = async (
  where: RequireOne<Prisma.StatusWhereUniqueInput>,
  status: Omit<Status, "status_id" | "created_at" | "updated_at">
) => {
  log.debug("updateStatus");

  return ORM.status.update({
    select: {
      status_id: true,
      status_name: true,
      color: true,
      updated_at: true,
    },
    data: {
      status_name: status.status_name,
      color: status.color,
    },
    where,
  });
};

const deleteStatus = async (where: RequireOne<Prisma.StatusWhereUniqueInput>) => {
  log.debug("deleteStatus");

  return ORM.status.delete({
    select: {
      status_id: true,
      status_name: true,
      color: true,
      updated_at: true,
    },
    where,
  });
};

const checkDuplicate = async (
  where: Pick<Required<Prisma.StatusWhereUniqueInput>, "status_name">,
  status_id?: number
) => {
  const duplicate = await findUniqueStatus(where);
  if (duplicate && (status_id == null || duplicate.status_id !== status_id)) {
    throw new AlreadyExistsError();
  }

  return duplicate;
};

const checkPreviousVersion = async (
  where: Pick<Required<Prisma.StatusWhereUniqueInput>, "status_id">,
  updated_at: string
) => {
  const previous = await findUniqueStatus(where);

  if (!previous) {
    throw new NotExistsError();
  } else if (!dayjs(previous.updated_at).isSame(updated_at)) {
    throw new UpdateConflictsError();
  }

  return previous;
};

export const StatusesRepository = {
  createStatus,
  findManyStatus,
  findUniqueStatus,
  updateStatus,
  deleteStatus,
  checkDuplicate,
  checkPreviousVersion,
} as const;
