CREATE SCHEMA "todo";
--> statement-breakpoint
CREATE TABLE "todo"."aichat" (
	"aichat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."file" (
	"file_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mimetype" varchar(100) NOT NULL,
	"filesize" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."session" (
	"session_id" serial PRIMARY KEY NOT NULL,
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
	"space_id" serial PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"space_name" varchar(100) NOT NULL,
	"space_description" varchar(400) DEFAULT '' NOT NULL,
	"space_order" integer DEFAULT 0 NOT NULL,
	"space_image" text DEFAULT '' NOT NULL,
	"space_color" varchar(100) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."todo" (
	"todo_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" integer NOT NULL,
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
	"file_id" uuid NOT NULL,
	CONSTRAINT "todo_to_file_todo_id_file_id_pk" PRIMARY KEY("todo_id","file_id")
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
	"aichat_enable" boolean DEFAULT false NOT NULL,
	"aichat_model" varchar(100) DEFAULT '' NOT NULL,
	"aichat_api_key" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "todo"."user_to_file" (
	"user_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	CONSTRAINT "user_to_file_user_id_file_id_pk" PRIMARY KEY("user_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "todo"."whiteboard" (
	"whiteboard_id" serial PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
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
ALTER TABLE "todo"."session" ADD CONSTRAINT "session_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."space" ADD CONSTRAINT "space_owner_id_user_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."todo" ADD CONSTRAINT "todo_space_id_space_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "todo"."space"("space_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."todo_to_file" ADD CONSTRAINT "todo_to_file_todo_id_todo_todo_id_fk" FOREIGN KEY ("todo_id") REFERENCES "todo"."todo"("todo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."todo_to_file" ADD CONSTRAINT "todo_to_file_file_id_file_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "todo"."file"("file_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."user_to_file" ADD CONSTRAINT "user_to_file_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "todo"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."user_to_file" ADD CONSTRAINT "user_to_file_file_id_file_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "todo"."file"("file_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."whiteboard" ADD CONSTRAINT "whiteboard_owner_id_user_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;