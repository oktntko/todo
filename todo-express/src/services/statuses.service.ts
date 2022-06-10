import { Status } from "@prisma/client";
import log from "~/middlewares/log";
import { StatusesRepository } from "~/repositories/statuses.repository";

// # POST /api/statuses
const postStatus = async (status: Omit<Status, "status_id" | "created_at" | "updated_at">) => {
  log.debug("postStatus", status);

  await StatusesRepository.checkDuplicate({ status_name: status.status_name });

  return StatusesRepository.createStatus(status);
};

// # GET /api/statuses
const getStatuses = async () => {
  log.debug("getStatuses");

  const statuses = await StatusesRepository.findManyStatus();

  return { statuses };
};

// # GET /api/statuses/:status_id
const getStatus = async (status_id: number) => {
  log.debug("getStatus", status_id);

  return StatusesRepository.findUniqueStatus({ status_id });
};

// # PUT /api/statuses/:status_id
const putStatus = async (
  status_id: number,
  status: Omit<Status, "status_id" | "created_at" | "updated_at">,
  updated_at: string
) => {
  log.debug("putStatus", status_id, status, updated_at);

  await StatusesRepository.checkDuplicate({ status_name: status.status_name }, status_id);

  return StatusesRepository.updateStatus({ status_id }, status);
};

// # DELETE /api/statuses/:status_id
const deleteStatus = async (status_id: number, updated_at: string) => {
  log.debug("deleteStatus", status_id, updated_at);

  return StatusesRepository.deleteStatus({ status_id });
};

// # PATCH /api/statuses/reorder
const patchStatusReorder = async (statuses: Pick<Status, "status_id" | "order">[]) => {
  log.debug("patchStatusReorder", statuses);

  return { statuses: await Promise.all(statuses.map(StatusesRepository.updateStatusOrder)) };
};

export const StatusesService = {
  postStatus,
  getStatuses,
  getStatus,
  putStatus,
  deleteStatus,
  patchStatusReorder,
} as const;
