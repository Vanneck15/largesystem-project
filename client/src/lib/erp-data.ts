import { Collection } from "./mock-store";
import * as seed from "./seed-data";

export const db = {
	users: new Collection("users", seed.seedUsers),
	courses: new Collection("courses", seed.seedCourses),
	exams: new Collection("exams", seed.seedExams),
	transcripts: new Collection("transcripts", seed.seedTranscripts),
	attendance: new Collection("attendance", seed.seedAttendance),
	invoices: new Collection("invoices", seed.seedInvoices),
	payments: new Collection("payments", seed.seedPayments),
	expenses: new Collection("expenses", seed.seedExpenses),
	campaigns: new Collection("campaigns", seed.seedCampaigns),
	employees: new Collection("employees", seed.seedEmployees),
	payroll: new Collection("payroll", seed.seedPayroll),
	leaveRequests: new Collection("leaveRequests", seed.seedLeaveRequests),
	performance: new Collection("performance", seed.seedPerformance),
	inventory: new Collection("inventory", seed.seedInventory),
};

export type ModuleKey = Exclude<keyof typeof db, "users">;
