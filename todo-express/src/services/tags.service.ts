import { Tag } from "@prisma/client";
import log from "~/middlewares/log";
import { TagsRepository } from "~/repositories/tags.repository";

// # POST /api/tags
const postTag = async (tag: Omit<Tag, "tag_id" | "created_at" | "updated_at">) => {
  log.debug("postTag", tag);

  await TagsRepository.checkDuplicate({ tag_name: tag.tag_name });

  return TagsRepository.createTag(tag);
};

// # GET /api/tags
const getTags = async () => {
  log.debug("getTags");

  const tags = await TagsRepository.findManyTag();

  return { tags };
};

// # GET /api/tags/:tag_id
const getTag = async (tag_id: number) => {
  log.debug("getTag", tag_id);

  return TagsRepository.findUniqueTag({ tag_id });
};

// # PUT /api/tags/:tag_id
const putTag = async (
  tag_id: number,
  tag: Omit<Tag, "tag_id" | "created_at" | "updated_at">,
  updated_at: string
) => {
  log.debug("putTag", tag_id, tag, updated_at);

  await TagsRepository.checkPreviousVersion({ tag_id }, updated_at);

  await TagsRepository.checkDuplicate({ tag_name: tag.tag_name }, tag_id);

  return TagsRepository.updateTag({ tag_id }, tag);
};

// # DELETE /api/tags/:tag_id
const deleteTag = async (tag_id: number, updated_at: string) => {
  log.debug("deleteTag", tag_id, updated_at);

  return TagsRepository.deleteTag({ tag_id });
};

export const TagsService = {
  postTag,
  getTags,
  getTag,
  putTag,
  deleteTag,
} as const;
