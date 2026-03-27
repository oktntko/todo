CREATE SCHEMA "todo";
--> statement-breakpoint
CREATE TYPE "public"."space_user_role" AS ENUM('OWNER', 'ADMIN', 'EDITOR', 'READER');--> statement-breakpoint
CREATE TABLE "todo"."aichat" (
	"aichat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"aichat_title" varchar(100) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."aichat_message" (
	"aichat_message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aichat_id" uuid NOT NULL,
	"user_id" uuid,
	"role" varchar(10) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."file" (
	"file_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mimetype" varchar(100) NOT NULL,
	"filesize" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."group" (
	"group_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"group_name" varchar(100) NOT NULL,
	"group_description" varchar(400) DEFAULT '' NOT NULL,
	"group_order" integer DEFAULT 0 NOT NULL,
	"group_image" text DEFAULT '' NOT NULL,
	"group_color" varchar(100) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."session" (
	"session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_key" varchar(255) NOT NULL,
	"originalMaxAge" integer,
	"expires" timestamp with time zone DEFAULT now(),
	"user_id" uuid,
	"data" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_session_key_unique" UNIQUE("session_key")
);
--> statement-breakpoint
CREATE TABLE "todo"."space" (
	"space_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_name" varchar(100) NOT NULL,
	"space_description" varchar(400) DEFAULT '' NOT NULL,
	"space_image" text DEFAULT '' NOT NULL,
	"space_color" varchar(100) DEFAULT '' NOT NULL,
	"aichat_enable" boolean DEFAULT false NOT NULL,
	"aichat_api_key" varchar(400) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."space_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"space_id" uuid NOT NULL,
	"role" "space_user_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."todo" (
	"todo_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"title" varchar(100) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"begin_date" varchar(10) DEFAULT '' NOT NULL,
	"begin_time" varchar(10) DEFAULT '' NOT NULL,
	"limit_date" varchar(10) DEFAULT '' NOT NULL,
	"limit_time" varchar(10) DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."todo_to_file" (
	"todo_id" uuid NOT NULL,
	"file_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."user" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"avatar_image" text DEFAULT '' NOT NULL,
	"description" varchar(400) DEFAULT '' NOT NULL,
	"twofa_enable" boolean DEFAULT false NOT NULL,
	"twofa_secret" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "todo"."whiteboard" (
	"whiteboard_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"whiteboard_name" varchar(100) DEFAULT '' NOT NULL,
	"whiteboard_description" varchar(400) DEFAULT '' NOT NULL,
	"whiteboard_order" integer DEFAULT 0 NOT NULL,
	"whiteboard_content" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "todo"."aichat" ADD CONSTRAINT "aichat_space_id_space_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "todo"."space"("space_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."aichat_message" ADD CONSTRAINT "aichat_message_aichat_id_aichat_aichat_id_fk" FOREIGN KEY ("aichat_id") REFERENCES "todo"."aichat"("aichat_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."aichat_message" ADD CONSTRAINT "aichat_message_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "todo"."user"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."file" ADD CONSTRAINT "file_space_id_space_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "todo"."space"("space_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."group" ADD CONSTRAINT "group_space_id_space_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "todo"."space"("space_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."session" ADD CONSTRAINT "session_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."space_user" ADD CONSTRAINT "space_user_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."space_user" ADD CONSTRAINT "space_user_space_id_space_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "todo"."space"("space_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."todo" ADD CONSTRAINT "todo_group_id_group_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "todo"."group"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."todo_to_file" ADD CONSTRAINT "todo_to_file_todo_id_todo_todo_id_fk" FOREIGN KEY ("todo_id") REFERENCES "todo"."todo"("todo_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."todo_to_file" ADD CONSTRAINT "todo_to_file_file_id_file_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "todo"."file"("file_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."whiteboard" ADD CONSTRAINT "whiteboard_space_id_space_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "todo"."space"("space_id") ON DELETE cascade ON UPDATE no action;