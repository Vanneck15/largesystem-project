import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ERP System Schema

// Users Table with Role-Based Access Control
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // 'admin', 'staff', 'student'
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Academic Module Tables
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  credits: integer("credits").notNull(),
  description: text("description"),
  instructorId: varchar("instructor_id").references(() => users.id),
  semester: text("semester"), // 'Fall 2024', 'Spring 2025', etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  examDate: timestamp("exam_date").notNull(),
  duration: integer("duration"), // in minutes
  totalMarks: integer("total_marks").notNull(),
  examType: text("exam_type").notNull(), // 'midterm', 'final', 'quiz'
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const transcripts = pgTable("transcripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  grade: text("grade").notNull(), // 'A', 'B+', 'C', etc.
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  semester: text("semester").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Student-Course Enrollments (Critical for Academic Module)
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  status: text("status").notNull().default('enrolled'), // 'enrolled', 'dropped', 'completed'
  enrollmentDate: timestamp("enrollment_date").default(sql`now()`),
  completionDate: timestamp("completion_date"),
  grade: text("grade"), // Final grade when completed
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  attendanceDate: timestamp("attendance_date").notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'late'
  remarks: text("remarks"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Finance & Marketing Module Tables
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'pending', 'paid', 'overdue', 'cancelled'
  dueDate: timestamp("due_date").notNull(),
  description: text("description"),
  invoiceNumber: text("invoice_number").unique().notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card', 'bank_transfer'
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // 'utilities', 'supplies', 'marketing'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'email', 'social_media', 'print', 'digital'
  budget: decimal("budget", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default('active'), // 'active', 'paused', 'completed'
  targetAudience: text("target_audience"),
  roi: decimal("roi", { precision: 5, scale: 2 }), // Return on Investment percentage
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Administration & HR Module Tables
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").unique().notNull(),
  userId: varchar("user_id").references(() => users.id),
  position: text("position").notNull(),
  department: text("department").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  hiredAt: timestamp("hired_at").notNull(),
  status: text("status").default('active'), // 'active', 'inactive', 'terminated'
  managerId: varchar("manager_id").references(() => employees.id),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payroll = pgTable("payroll", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  payPeriod: text("pay_period").notNull(), // 'January 2024', 'February 2024'
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default('0'),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default('0'),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default('0'),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  payDate: timestamp("pay_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  leaveType: text("leave_type").notNull(), // 'sick', 'vacation', 'personal', 'maternity'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  approvedBy: varchar("approved_by").references(() => employees.id),
  approvalDate: timestamp("approval_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const performance = pgTable("performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  reviewPeriod: text("review_period").notNull(), // 'Q1 2024', 'Annual 2024'
  reviewerId: varchar("reviewer_id").notNull().references(() => employees.id),
  overallRating: integer("overall_rating").notNull(), // 1-5 scale
  goals: text("goals"),
  achievements: text("achievements"),
  areasForImprovement: text("areas_for_improvement"),
  comments: text("comments"),
  reviewDate: timestamp("review_date").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(), // 'office_supplies', 'equipment', 'furniture'
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(), // 'pieces', 'boxes', 'kg'
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  supplier: text("supplier"),
  location: text("location"), // 'warehouse', 'office', 'lab'
  minimumStock: integer("minimum_stock").default(0),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  transcripts: many(transcripts),
  attendance: many(attendance),
  invoices: many(invoices),
  employee: many(employees),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  exams: many(exams),
  transcripts: many(transcripts),
  attendance: many(attendance),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
  }),
  payroll: many(payroll),
  leaveRequests: many(leaveRequests),
  performance: many(performance),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
});

export const insertTranscriptSchema = createInsertSchema(transcripts).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceSchema = createInsertSchema(performance).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type Performance = typeof performance.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
