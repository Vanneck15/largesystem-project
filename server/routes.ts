import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService, authenticateToken, requireRole, requireAdmin, requireStaffOrAdmin, type AuthenticatedRequest } from "./services/auth";
import { 
  insertUserSchema,
  insertCourseSchema, 
  insertExamSchema, 
  insertTranscriptSchema, 
  insertAttendanceSchema,
  insertInvoiceSchema, 
  insertPaymentSchema, 
  insertExpenseSchema, 
  insertCampaignSchema,
  insertEmployeeSchema, 
  insertPayrollSchema, 
  insertLeaveRequestSchema, 
  insertPerformanceSchema, 
  insertInventorySchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }

      // Note: Role is not required from client - AuthService forces 'student' for security
      const result = await authService.register({ email, password, name });
      res.status(201).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await authService.login({ email, password });
      res.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(401).json({ message });
    }
  });

  app.post("/api/auth/refresh", authenticateToken, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const result = await authService.refreshToken(token);
      res.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(401).json({ message });
    }
  });

  app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { oldPassword, newPassword } = req.body;
      
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Old password and new password are required" });
      }

      if (!authReq.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      await authService.changePassword(authReq.user.id, oldPassword, newPassword);
      res.json({ message: "Password changed successfully" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ message });
    }
  });

  // User Management Routes (Admin only)
  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      // This would need a getAllUsers method in storage
      res.json({ message: "Get all users endpoint - to be implemented" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Academic Module Routes
  
  // Courses
  app.get("/api/academic/courses", authenticateToken, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/academic/courses", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.get("/api/academic/courses/:id", authenticateToken, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.patch("/api/academic/courses/:id", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const course = await storage.updateCourse(req.params.id, req.body);
      res.json(course);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.delete("/api/academic/courses/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Exams
  app.get("/api/academic/exams", authenticateToken, async (req, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/academic/exams", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertExamSchema.parse(req.body);
      const exam = await storage.createExam(validatedData);
      res.status(201).json(exam);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exam data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Transcripts
  app.get("/api/academic/transcripts", authenticateToken, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Students can only see their own transcripts
      if (authReq.user?.role === 'student') {
        const transcripts = await storage.getTranscriptsByStudent(authReq.user.id);
        return res.json(transcripts);
      }
      
      // Staff and admin can see all transcripts
      const transcripts = await storage.getTranscripts();
      res.json(transcripts);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/academic/transcripts", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertTranscriptSchema.parse(req.body);
      const transcript = await storage.createTranscript(validatedData);
      res.status(201).json(transcript);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transcript data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Attendance
  app.get("/api/academic/attendance", authenticateToken, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Students can only see their own attendance
      if (authReq.user?.role === 'student') {
        const attendance = await storage.getAttendanceByStudent(authReq.user.id);
        return res.json(attendance);
      }
      
      // Staff and admin can see all attendance
      const attendance = await storage.getAttendance();
      res.json(attendance);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/academic/attendance", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Finance Module Routes
  
  // Invoices
  app.get("/api/finance/invoices", authenticateToken, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Students can only see their own invoices
      if (authReq.user?.role === 'student') {
        const invoices = await storage.getInvoicesByStudent(authReq.user.id);
        return res.json(invoices);
      }
      
      // Staff and admin can see all invoices
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/finance/invoices", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/finance/invoices/:id/pay", authenticateToken, async (req, res) => {
    try {
      const { paymentMethod, transactionId } = req.body;
      const invoiceId = req.params.id;
      
      // Get invoice to determine amount
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Create payment record
      const payment = await storage.createPayment({
        invoiceId,
        amount: invoice.amount,
        paymentMethod: paymentMethod || 'online',
        transactionId
      });
      
      // Update invoice status to paid
      await storage.updateInvoice(invoiceId, { status: 'paid' });
      
      res.status(201).json({ payment, message: "Payment processed successfully" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Payments
  app.get("/api/finance/payments", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Expenses
  app.get("/api/finance/expenses", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/finance/expenses", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Campaigns
  app.get("/api/finance/campaigns", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/finance/campaigns", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // HR Module Routes
  
  // Employees
  app.get("/api/hr/employees", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/hr/employees", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Payroll
  app.get("/api/hr/payroll", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const payrolls = await storage.getPayrolls();
      res.json(payrolls);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/hr/payroll", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPayrollSchema.parse(req.body);
      const payroll = await storage.createPayroll(validatedData);
      res.status(201).json(payroll);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payroll data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Leave Requests
  app.get("/api/hr/leave-requests", authenticateToken, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Employees can see their own leave requests
      if (authReq.user?.role === 'staff') {
        // Find employee record for this user
        const employees = await storage.getEmployees();
        const employee = employees.find(emp => emp.userId === authReq.user?.id);
        if (employee) {
          const leaveRequests = await storage.getLeaveRequestsByEmployee(employee.id);
          return res.json(leaveRequests);
        }
      }
      
      // Admin can see all leave requests
      const leaveRequests = await storage.getLeaveRequests();
      res.json(leaveRequests);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/hr/leave-requests", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertLeaveRequestSchema.parse(req.body);
      const leaveRequest = await storage.createLeaveRequest(validatedData);
      res.status(201).json(leaveRequest);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid leave request data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Performance Reviews
  app.get("/api/hr/performance", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const reviews = await storage.getPerformanceReviews();
      res.json(reviews);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/hr/performance", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertPerformanceSchema.parse(req.body);
      const review = await storage.createPerformanceReview(validatedData);
      res.status(201).json(review);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid performance review data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Inventory
  app.get("/api/hr/inventory", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.get("/api/hr/inventory/low-stock", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  app.post("/api/hr/inventory", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
