-- Migration: Add lessons, attendance, and grades tables
-- Created: 2025-01-27

CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" varchar(100) NOT NULL,
	"subject_id" varchar(100) NOT NULL,
	"teacher_id" varchar(100),
	"title" varchar(200) NOT NULL,
	"content" text,
	"lesson_date" varchar(10) NOT NULL,
	"start_time" varchar(10),
	"end_time" varchar(10),
	"objectives" text,
	"methodology" text,
	"resources" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" varchar(100) NOT NULL,
	"class_id" varchar(100) NOT NULL,
	"subject_id" varchar(100) NOT NULL,
	"date" varchar(10) NOT NULL,
	"status" varchar(1) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" varchar(100) NOT NULL,
	"class_id" varchar(100) NOT NULL,
	"subject_id" varchar(100),
	"term_id" varchar(100),
	"n1" integer,
	"n2" integer,
	"n3" integer,
	"n4" integer,
	"average" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- Create indexes for better query performance
CREATE INDEX "idx_lessons_class_subject" ON "lessons"("class_id", "subject_id");
--> statement-breakpoint
CREATE INDEX "idx_attendance_student_date" ON "attendance"("student_id", "date");
--> statement-breakpoint
CREATE INDEX "idx_attendance_class_subject" ON "attendance"("class_id", "subject_id");
--> statement-breakpoint
CREATE INDEX "idx_grades_student_class" ON "grades"("student_id", "class_id");
--> statement-breakpoint
CREATE INDEX "idx_grades_class_subject" ON "grades"("class_id", "subject_id");

