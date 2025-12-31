ALTER TABLE "todo"."space" RENAME TO "group";--> statement-breakpoint
ALTER TABLE "todo"."group" RENAME COLUMN "space_id" TO "group_id";--> statement-breakpoint
ALTER TABLE "todo"."group" RENAME COLUMN "space_name" TO "group_name";--> statement-breakpoint
ALTER TABLE "todo"."group" RENAME COLUMN "space_description" TO "group_description";--> statement-breakpoint
ALTER TABLE "todo"."group" RENAME COLUMN "space_order" TO "group_order";--> statement-breakpoint
ALTER TABLE "todo"."group" RENAME COLUMN "space_image" TO "group_image";--> statement-breakpoint
ALTER TABLE "todo"."group" RENAME COLUMN "space_color" TO "group_color";--> statement-breakpoint
ALTER TABLE "todo"."todo" RENAME COLUMN "space_id" TO "group_id";--> statement-breakpoint
ALTER TABLE "todo"."group" DROP CONSTRAINT "space_owner_id_user_user_id_fk";
--> statement-breakpoint
ALTER TABLE "todo"."todo" DROP CONSTRAINT "todo_space_id_space_space_id_fk";
--> statement-breakpoint
ALTER TABLE "todo"."group" ADD CONSTRAINT "group_owner_id_user_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."todo" ADD CONSTRAINT "todo_group_id_group_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "todo"."group"("group_id") ON DELETE cascade ON UPDATE no action;