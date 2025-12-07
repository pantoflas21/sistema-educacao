/**
 * Utilitários de validação e sanitização
 * Protege contra injection attacks e dados inválidos
 */

import { z } from 'zod';

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove < e > para prevenir XSS básico
    .replace(/\0/g, ''); // Remove null bytes
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(input: unknown): string {
  const email = sanitizeString(input, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }
  
  return email.toLowerCase();
}

/**
 * Valida e sanitiza senha
 */
export function sanitizePassword(input: unknown): string {
  const password = String(input || '').slice(0, 100);
  
  if (password.length < 6) {
    throw new Error('Senha deve ter no mínimo 6 caracteres');
  }
  
  if (password.length > 100) {
    throw new Error('Senha muito longa');
  }
  
  return password;
}

/**
 * Valida e sanitiza ID (UUID ou string simples)
 */
export function sanitizeId(input: unknown): string {
  const id = sanitizeString(input, 100);
  
  if (!id || id.length === 0) {
    throw new Error('ID inválido');
  }
  
  return id;
}

/**
 * Valida e sanitiza número
 */
export function sanitizeNumber(input: unknown, min?: number, max?: number): number {
  const num = Number(input);
  
  if (isNaN(num)) {
    throw new Error('Número inválido');
  }
  
  if (min !== undefined && num < min) {
    throw new Error(`Número deve ser maior ou igual a ${min}`);
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`Número deve ser menor ou igual a ${max}`);
  }
  
  return num;
}

/**
 * Schemas Zod para validação
 */
export const schemas = {
  login: z.object({
    email: z.string().email().max(255),
    password: z.string().min(6).max(100)
  }),
  
  createUser: z.object({
    email: z.string().email().max(255),
    password: z.string().min(6).max(100),
    role: z.enum(['Admin', 'Teacher', 'Student', 'Secretary', 'Treasury', 'EducationSecretary']),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    schoolId: z.string().max(100).optional()
  }),
  
  createLesson: z.object({
    classId: z.string().min(1).max(100),
    subjectId: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    content: z.string().max(10000).optional(),
    lessonDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().max(10).optional(),
    endTime: z.string().max(10).optional(),
    objectives: z.string().max(2000).optional(),
    methodology: z.string().max(2000).optional(),
    resources: z.string().max(2000).optional()
  }),
  
  updateGrades: z.object({
    classId: z.string().min(1).max(100),
    studentId: z.string().min(1).max(100),
    subjectId: z.string().max(100).optional(),
    termId: z.string().max(100).optional(),
    n1: z.number().min(0).max(10),
    n2: z.number().min(0).max(10),
    n3: z.number().min(0).max(10),
    n4: z.number().min(0).max(10)
  }),
  
  attendance: z.object({
    studentId: z.string().min(1).max(100),
    classId: z.string().min(1).max(100),
    subjectId: z.string().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['P', 'F', 'J'])
  }),
  
  createSchool: z.object({
    name: z.string().min(1).max(256),
    city: z.string().max(128).optional(),
    state: z.string().max(64).optional()
  }),
  
  createClass: z.object({
    code: z.string().min(1).max(64),
    name: z.string().min(1).max(128),
    capacity: z.number().int().min(1).max(100).optional(),
    shift: z.string().max(32).optional(),
    schoolId: z.number().int().optional()
  }),
  
  createSubject: z.object({
    code: z.string().min(1).max(64),
    name: z.string().min(1).max(256),
    workload: z.number().int().min(1).max(40).optional()
  }),
  
  createStudent: z.object({
    name: z.string().min(1).max(200),
    matricula: z.string().max(50).optional(),
    email: z.string().email().max(255).optional(),
    birthDate: z.string().max(10).optional(),
    classId: z.string().min(1).max(100)
  }),
  
  createEnrollment: z.object({
    studentId: z.number().int().positive(),
    classId: z.number().int().positive(),
    subjectId: z.number().int().positive(),
    enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }),
  
  createInvoice: z.object({
    studentId: z.number().int().positive(),
    classId: z.number().int().positive(),
    period: z.string().regex(/^\d{4}-\d{2}$/),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    total: z.number().int().positive(),
    status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional()
  }),
  
  lessonPlan: z.object({
    teacherId: z.string().min(1).max(100),
    classId: z.string().min(1).max(100),
    subjectId: z.string().min(1).max(100),
    category: z.enum(['educacao-infantil', 'fundamental-1', 'fundamental-2', 'ensino-medio']),
    title: z.string().min(1).max(200),
    content: z.string().max(50000).optional(),
    objectives: z.string().max(2000).optional(),
    methodology: z.string().max(2000).optional(),
    resources: z.string().max(2000).optional()
  }),
  
  reviewLessonPlan: z.object({
    status: z.enum(['approved', 'rejected', 'revision']),
    feedback: z.string().max(2000).optional()
  })
};

/**
 * Middleware de validação usando Zod
 */
export function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Substituir body pelo validado
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(400).json({
          error: 'validation_error',
          message: 'Dados inválidos',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

