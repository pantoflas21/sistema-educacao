-- Migration: Adicionar tabela students
-- Data: 2025-01-27

CREATE TABLE IF NOT EXISTS "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"cpf" varchar(20),
	"rg" varchar(20),
	"birth_date" varchar(10),
	"class_id" integer,
	"address" text,
	"guardians" text,
	"medical_info" text,
	"matricula" varchar(50),
	"created_at" timestamp DEFAULT now()
);

