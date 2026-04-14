CREATE TYPE "public"."notification_status" AS ENUM('PLANNING', 'QUEUING', 'UNREAD', 'READ');--> statement-breakpoint
CREATE TABLE "todo"."notification" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_title" varchar(400) NOT NULL,
	"notification_body" varchar(400) DEFAULT '' NOT NULL,
	"notification_link" varchar(400) DEFAULT '' NOT NULL,
	"notification_status" "notification_status" NOT NULL,
	"notification_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo"."notification_todo" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"todo_id" uuid NOT NULL,
	"notification_title" varchar(400) NOT NULL,
	"notification_body" varchar(400) DEFAULT '' NOT NULL,
	"notification_link" varchar(400) DEFAULT '' NOT NULL,
	"notification_status" "notification_status" NOT NULL,
	"notification_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "todo"."notification" ADD CONSTRAINT "notification_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."notification_todo" ADD CONSTRAINT "notification_todo_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "todo"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo"."notification_todo" ADD CONSTRAINT "notification_todo_todo_id_todo_todo_id_fk" FOREIGN KEY ("todo_id") REFERENCES "todo"."todo"("todo_id") ON DELETE cascade ON UPDATE no action;