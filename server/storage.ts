import { 
  // Users and Auth
  type User, 
  type InsertUser,
  users,
  
  // Academic Module
  type Course,
  type InsertCourse,
  type Exam,
  type InsertExam,
  type Transcript,
  type InsertTranscript,
  type Attendance,
  type InsertAttendance,
  courses,
  exams,
  transcripts,
  attendance,
  
  // Finance Module
  type Invoice,
  type InsertInvoice,
  type Payment,
  type InsertPayment,
  type Expense,
  type InsertExpense,
  type Campaign,
  type InsertCampaign,
  invoices,
  payments,
  expenses,
  campaigns,
  
  // HR Module
  type Employee,
  type InsertEmployee,
  type Payroll,
  type InsertPayroll,
  type LeaveRequest,
  type InsertLeaveRequest,
  type Performance,
  type InsertPerformance,
  type Inventory,
  type InsertInventory,
  employees,
  payroll,
  leaveRequests,
  performance,
  inventory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User Management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Academic Module
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
  
  getExams(): Promise<Exam[]>;
  getExam(id: string): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: string, updates: Partial<InsertExam>): Promise<Exam>;
  deleteExam(id: string): Promise<void>;
  getExamsByCourse(courseId: string): Promise<Exam[]>;
  
  getTranscripts(): Promise<Transcript[]>;
  getTranscript(id: string): Promise<Transcript | undefined>;
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  updateTranscript(id: string, updates: Partial<InsertTranscript>): Promise<Transcript>;
  deleteTranscript(id: string): Promise<void>;
  getTranscriptsByStudent(studentId: string): Promise<Transcript[]>;
  
  getAttendance(): Promise<Attendance[]>;
  getAttendanceRecord(id: string): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance>;
  deleteAttendance(id: string): Promise<void>;
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>;
  getAttendanceByCourse(courseId: string): Promise<Attendance[]>;
  
  // Finance Module
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;
  getInvoicesByStudent(studentId: string): Promise<Invoice[]>;
  
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment>;
  deletePayment(id: string): Promise<void>;
  getPaymentsByInvoice(invoiceId: string): Promise<Payment[]>;
  
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, updates: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  
  // HR Module
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
  getEmployeesByDepartment(department: string): Promise<Employee[]>;
  
  getPayrolls(): Promise<Payroll[]>;
  getPayroll(id: string): Promise<Payroll | undefined>;
  createPayroll(payrollData: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: string, updates: Partial<InsertPayroll>): Promise<Payroll>;
  deletePayroll(id: string): Promise<void>;
  getPayrollsByEmployee(employeeId: string): Promise<Payroll[]>;
  
  getLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest>;
  deleteLeaveRequest(id: string): Promise<void>;
  getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]>;
  
  getPerformanceReviews(): Promise<Performance[]>;
  getPerformanceReview(id: string): Promise<Performance | undefined>;
  createPerformanceReview(performance: InsertPerformance): Promise<Performance>;
  updatePerformanceReview(id: string, updates: Partial<InsertPerformance>): Promise<Performance>;
  deletePerformanceReview(id: string): Promise<void>;
  getPerformanceReviewsByEmployee(employeeId: string): Promise<Performance[]>;
  
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: string): Promise<void>;
  getLowStockItems(): Promise<Inventory[]>;
}

export class DatabaseStorage implements IStorage {
  // User Management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Academic Module - Courses
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return await db.select().from(courses)
      .where(eq(courses.instructorId, instructorId))
      .orderBy(desc(courses.createdAt));
  }

  // Academic Module - Exams
  async getExams(): Promise<Exam[]> {
    return await db.select().from(exams).orderBy(desc(exams.createdAt));
  }

  async getExam(id: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam || undefined;
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [newExam] = await db
      .insert(exams)
      .values(exam)
      .returning();
    return newExam;
  }

  async updateExam(id: string, updates: Partial<InsertExam>): Promise<Exam> {
    const [exam] = await db
      .update(exams)
      .set(updates)
      .where(eq(exams.id, id))
      .returning();
    return exam;
  }

  async deleteExam(id: string): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  async getExamsByCourse(courseId: string): Promise<Exam[]> {
    return await db.select().from(exams)
      .where(eq(exams.courseId, courseId))
      .orderBy(desc(exams.examDate));
  }

  // Academic Module - Transcripts
  async getTranscripts(): Promise<Transcript[]> {
    return await db.select().from(transcripts).orderBy(desc(transcripts.createdAt));
  }

  async getTranscript(id: string): Promise<Transcript | undefined> {
    const [transcript] = await db.select().from(transcripts).where(eq(transcripts.id, id));
    return transcript || undefined;
  }

  async createTranscript(transcript: InsertTranscript): Promise<Transcript> {
    const [newTranscript] = await db
      .insert(transcripts)
      .values(transcript)
      .returning();
    return newTranscript;
  }

  async updateTranscript(id: string, updates: Partial<InsertTranscript>): Promise<Transcript> {
    const [transcript] = await db
      .update(transcripts)
      .set(updates)
      .where(eq(transcripts.id, id))
      .returning();
    return transcript;
  }

  async deleteTranscript(id: string): Promise<void> {
    await db.delete(transcripts).where(eq(transcripts.id, id));
  }

  async getTranscriptsByStudent(studentId: string): Promise<Transcript[]> {
    return await db.select().from(transcripts)
      .where(eq(transcripts.studentId, studentId))
      .orderBy(desc(transcripts.year), desc(transcripts.semester));
  }

  // Academic Module - Attendance
  async getAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.createdAt));
  }

  async getAttendanceRecord(id: string): Promise<Attendance | undefined> {
    const [record] = await db.select().from(attendance).where(eq(attendance.id, id));
    return record || undefined;
  }

  async createAttendance(attendanceRecord: InsertAttendance): Promise<Attendance> {
    const [newRecord] = await db
      .insert(attendance)
      .values(attendanceRecord)
      .returning();
    return newRecord;
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance> {
    const [record] = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return record;
  }

  async deleteAttendance(id: string): Promise<void> {
    await db.delete(attendance).where(eq(attendance.id, id));
  }

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    return await db.select().from(attendance)
      .where(eq(attendance.studentId, studentId))
      .orderBy(desc(attendance.attendanceDate));
  }

  async getAttendanceByCourse(courseId: string): Promise<Attendance[]> {
    return await db.select().from(attendance)
      .where(eq(attendance.courseId, courseId))
      .orderBy(desc(attendance.attendanceDate));
  }

  // Finance Module - Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  async updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getInvoicesByStudent(studentId: string): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.studentId, studentId))
      .orderBy(desc(invoices.dueDate));
  }

  // Finance Module - Payments
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.paymentDate));
  }

  // Finance Module - Expenses
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.createdAt));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values(expense)
      .returning();
    return newExpense;
  }

  async updateExpense(id: string, updates: Partial<InsertExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Finance Module - Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(campaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // HR Module - Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee> {
    const [employee] = await db
      .update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    return await db.select().from(employees)
      .where(eq(employees.department, department))
      .orderBy(desc(employees.createdAt));
  }

  // HR Module - Payroll
  async getPayrolls(): Promise<Payroll[]> {
    return await db.select().from(payroll).orderBy(desc(payroll.createdAt));
  }

  async getPayroll(id: string): Promise<Payroll | undefined> {
    const [payrollRecord] = await db.select().from(payroll).where(eq(payroll.id, id));
    return payrollRecord || undefined;
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const [newPayroll] = await db
      .insert(payroll)
      .values(payrollData)
      .returning();
    return newPayroll;
  }

  async updatePayroll(id: string, updates: Partial<InsertPayroll>): Promise<Payroll> {
    const [payrollRecord] = await db
      .update(payroll)
      .set(updates)
      .where(eq(payroll.id, id))
      .returning();
    return payrollRecord;
  }

  async deletePayroll(id: string): Promise<void> {
    await db.delete(payroll).where(eq(payroll.id, id));
  }

  async getPayrollsByEmployee(employeeId: string): Promise<Payroll[]> {
    return await db.select().from(payroll)
      .where(eq(payroll.employeeId, employeeId))
      .orderBy(desc(payroll.createdAt));
  }

  // HR Module - Leave Requests
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
  }

  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    const [request] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return request || undefined;
  }

  async createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [newRequest] = await db
      .insert(leaveRequests)
      .values(leaveRequest)
      .returning();
    return newRequest;
  }

  async updateLeaveRequest(id: string, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    const [request] = await db
      .update(leaveRequests)
      .set(updates)
      .where(eq(leaveRequests.id, id))
      .returning();
    return request;
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
  }

  async getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests)
      .where(eq(leaveRequests.employeeId, employeeId))
      .orderBy(desc(leaveRequests.startDate));
  }

  // HR Module - Performance Reviews
  async getPerformanceReviews(): Promise<Performance[]> {
    return await db.select().from(performance).orderBy(desc(performance.createdAt));
  }

  async getPerformanceReview(id: string): Promise<Performance | undefined> {
    const [review] = await db.select().from(performance).where(eq(performance.id, id));
    return review || undefined;
  }

  async createPerformanceReview(performanceData: InsertPerformance): Promise<Performance> {
    const [newReview] = await db
      .insert(performance)
      .values(performanceData)
      .returning();
    return newReview;
  }

  async updatePerformanceReview(id: string, updates: Partial<InsertPerformance>): Promise<Performance> {
    const [review] = await db
      .update(performance)
      .set(updates)
      .where(eq(performance.id, id))
      .returning();
    return review;
  }

  async deletePerformanceReview(id: string): Promise<void> {
    await db.delete(performance).where(eq(performance.id, id));
  }

  async getPerformanceReviewsByEmployee(employeeId: string): Promise<Performance[]> {
    return await db.select().from(performance)
      .where(eq(performance.employeeId, employeeId))
      .orderBy(desc(performance.reviewDate));
  }

  // HR Module - Inventory
  async getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory).orderBy(desc(inventory.createdAt));
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db
      .insert(inventory)
      .values(item)
      .returning();
    return newItem;
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<Inventory> {
    const [item] = await db
      .update(inventory)
      .set({ ...updates, lastUpdated: sql`now()` })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return await db.select().from(inventory)
      .where(sql`${inventory.quantity} <= ${inventory.minimumStock}`)
      .orderBy(desc(inventory.lastUpdated));
  }
}

export const storage = new DatabaseStorage();
