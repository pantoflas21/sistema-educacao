import { pgTable, serial, varchar, integer, timestamp, boolean, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  role: varchar("role", { length: 64 }).notNull(),
  firstName: varchar("first_name", { length: 128 }),
  lastName: varchar("last_name", { length: 128 }),
  schoolId: integer("school_id"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  capacity: integer("capacity").default(40),
  shift: varchar("shift", { length: 32 }).default("manha"),
  schoolId: integer("school_id")
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  workload: integer("workload").default(4)
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  enrollmentDate: varchar("enrollment_date", { length: 10 }).notNull()
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  period: varchar("period", { length: 7 }).notNull(),
  dueDate: varchar("due_date", { length: 10 }).notNull(),
  total: integer("total").notNull(),
  status: varchar("status", { length: 32 }).default("pending"),
  boletoLine: text("boleto_line"),
  boletoBar: text("boleto_bar")
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  classId: varchar("class_id", { length: 100 }).notNull(),
  subjectId: varchar("subject_id", { length: 100 }).notNull(),
  teacherId: varchar("teacher_id", { length: 100 }),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  lessonDate: varchar("lesson_date", { length: 10 }).notNull(),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  objectives: text("objectives"),
  methodology: text("methodology"),
  resources: text("resources"),
  createdAt: timestamp("created_at").defaultNow()
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 100 }).notNull(),
  classId: varchar("class_id", { length: 100 }).notNull(),
  subjectId: varchar("subject_id", { length: 100 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  status: varchar("status", { length: 1 }).notNull(), // P, F, J
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 100 }).notNull(),
  classId: varchar("class_id", { length: 100 }).notNull(),
  subjectId: varchar("subject_id", { length: 100 }).notNull(),
  termId: varchar("term_id", { length: 100 }),
  n1: integer("n1"),
  n2: integer("n2"),
  n3: integer("n3"),
  n4: integer("n4"),
  average: integer("average"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  cpf: varchar("cpf", { length: 20 }),
  rg: varchar("rg", { length: 20 }),
  birthDate: varchar("birth_date", { length: 10 }),
  classId: integer("class_id"),
  address: text("address"),
  guardians: text("guardians"),
  medicalInfo: text("medical_info"),
  matricula: varchar("matricula", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow()
});