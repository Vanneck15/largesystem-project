// Données de démonstration réalistes pour chaque module de l'ERP.

function daysFromNow(n: number) {
	const d = new Date();
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
}

export const seedUsers = [
	{ id: "u-admin", email: "admin@erp.com", name: "Aïcha Ndiaye", role: "admin" as const, department: "Direction" },
	{ id: "u-staff", email: "staff@erp.com", name: "Karim Traoré", role: "staff" as const, department: "Académique" },
	{ id: "u-student", email: "student@erp.com", name: "Léa Fontaine", role: "student" as const, department: "Étudiant" },
];

export const seedCourses = [
	{ id: "c1", code: "INF301", title: "JavaScript moderne (ES2023)", credits: 4, instructor: "Karim Traoré", semester: "Automne 2026", isActive: true },
	{ id: "c2", code: "INF210", title: "Bases de données relationnelles", credits: 3, instructor: "Sophie Marchand", semester: "Automne 2026", isActive: true },
	{ id: "c3", code: "MGT150", title: "Introduction au management", credits: 3, instructor: "Paul Rousseau", semester: "Automne 2026", isActive: true },
	{ id: "c4", code: "INF410", title: "Architecture logicielle", credits: 5, instructor: "Karim Traoré", semester: "Printemps 2027", isActive: false },
	{ id: "c5", code: "MKT220", title: "Marketing digital", credits: 3, instructor: "Nadia Belkacem", semester: "Automne 2026", isActive: true },
	{ id: "c6", code: "FIN180", title: "Comptabilité générale", credits: 4, instructor: "Paul Rousseau", semester: "Automne 2026", isActive: true },
];

export const seedExams = [
	{ id: "e1", courseCode: "INF301", title: "Partiel — closures & promesses", examDate: daysFromNow(6), duration: 90, totalMarks: 20, examType: "midterm" as const },
	{ id: "e2", courseCode: "INF210", title: "Examen final — modélisation", examDate: daysFromNow(21), duration: 120, totalMarks: 20, examType: "final" as const },
	{ id: "e3", courseCode: "MGT150", title: "Quiz — fondamentaux", examDate: daysFromNow(-3), duration: 30, totalMarks: 10, examType: "quiz" as const },
	{ id: "e4", courseCode: "MKT220", title: "Étude de cas", examDate: daysFromNow(12), duration: 60, totalMarks: 20, examType: "midterm" as const },
];

export const seedTranscripts = [
	{ id: "t1", studentName: "Léa Fontaine", courseCode: "INF301", grade: "A", gpa: "3.80", semester: "Automne 2026", year: 2026 },
	{ id: "t2", studentName: "Léa Fontaine", courseCode: "MGT150", grade: "B+", gpa: "3.30", semester: "Automne 2026", year: 2026 },
	{ id: "t3", studentName: "Yanis Cherif", courseCode: "INF210", grade: "A-", gpa: "3.70", semester: "Automne 2026", year: 2026 },
	{ id: "t4", studentName: "Inès Dupuis", courseCode: "FIN180", grade: "C+", gpa: "2.30", semester: "Automne 2026", year: 2026 },
];

export const seedAttendance = [
	{ id: "a1", studentName: "Léa Fontaine", courseCode: "INF301", attendanceDate: daysFromNow(-1), status: "present" as const },
	{ id: "a2", studentName: "Léa Fontaine", courseCode: "MGT150", attendanceDate: daysFromNow(-1), status: "late" as const },
	{ id: "a3", studentName: "Yanis Cherif", courseCode: "INF210", attendanceDate: daysFromNow(-2), status: "absent" as const },
	{ id: "a4", studentName: "Inès Dupuis", courseCode: "FIN180", attendanceDate: daysFromNow(-2), status: "present" as const },
];

export const seedInvoices = [
	{ id: "i1", invoiceNumber: "FAC-2026-0142", studentName: "Léa Fontaine", amount: "890.00", status: "paid" as const, dueDate: daysFromNow(-10), description: "Frais de scolarité — semestre 1" },
	{ id: "i2", invoiceNumber: "FAC-2026-0143", studentName: "Yanis Cherif", amount: "890.00", status: "pending" as const, dueDate: daysFromNow(9), description: "Frais de scolarité — semestre 1" },
	{ id: "i3", invoiceNumber: "FAC-2026-0144", studentName: "Inès Dupuis", amount: "450.00", status: "overdue" as const, dueDate: daysFromNow(-5), description: "Frais de bibliothèque et laboratoire" },
	{ id: "i4", invoiceNumber: "FAC-2026-0145", studentName: "Malik Benali", amount: "890.00", status: "pending" as const, dueDate: daysFromNow(15), description: "Frais de scolarité — semestre 1" },
];

export const seedPayments = [
	{ id: "p1", invoiceNumber: "FAC-2026-0142", amount: "890.00", paymentMethod: "card" as const, transactionId: "TX-88213", paymentDate: daysFromNow(-9) },
	{ id: "p2", invoiceNumber: "FAC-2026-0140", amount: "450.00", paymentMethod: "bank_transfer" as const, transactionId: "TX-88097", paymentDate: daysFromNow(-20) },
];

export const seedExpenses = [
	{ id: "x1", category: "utilities" as const, amount: "1240.50", description: "Facture électricité — campus principal", expenseDate: daysFromNow(-8), status: "approved" as const },
	{ id: "x2", category: "supplies" as const, amount: "320.00", description: "Fournitures de bureau", expenseDate: daysFromNow(-3), status: "pending" as const },
	{ id: "x3", category: "marketing" as const, amount: "2100.00", description: "Campagne portes ouvertes", expenseDate: daysFromNow(-15), status: "approved" as const },
];

export const seedCampaigns = [
	{ id: "cp1", name: "Journée portes ouvertes 2026", type: "digital" as const, budget: "5000.00", startDate: daysFromNow(-20), endDate: daysFromNow(10), status: "active" as const, roi: "18.50" },
	{ id: "cp2", name: "Newsletter mensuelle", type: "email" as const, budget: "300.00", startDate: daysFromNow(-60), endDate: null, status: "active" as const, roi: "42.00" },
	{ id: "cp3", name: "Salon étudiant printemps", type: "print" as const, budget: "1800.00", startDate: daysFromNow(30), endDate: daysFromNow(32), status: "paused" as const, roi: null },
];

export const seedEmployees = [
	{ id: "emp1", employeeId: "EMP-001", name: "Karim Traoré", position: "Professeur", department: "Informatique", salary: "4200.00", hiredAt: "2019-09-01", status: "active" as const },
	{ id: "emp2", employeeId: "EMP-002", name: "Sophie Marchand", position: "Professeure", department: "Informatique", salary: "3900.00", hiredAt: "2021-01-15", status: "active" as const },
	{ id: "emp3", employeeId: "EMP-003", name: "Paul Rousseau", position: "Chargé de cours", department: "Gestion", salary: "3100.00", hiredAt: "2022-08-20", status: "active" as const },
	{ id: "emp4", employeeId: "EMP-004", name: "Nadia Belkacem", position: "Responsable marketing", department: "Communication", salary: "3400.00", hiredAt: "2020-03-10", status: "active" as const },
	{ id: "emp5", employeeId: "EMP-005", name: "Julien Petit", position: "Technicien informatique", department: "IT", salary: "2600.00", hiredAt: "2023-11-05", status: "inactive" as const },
];

export const seedPayroll = [
	{ id: "pr1", employeeName: "Karim Traoré", payPeriod: "Juillet 2026", baseSalary: "4200.00", overtime: "150.00", bonuses: "0.00", deductions: "620.00", netPay: "3730.00", payDate: daysFromNow(-20) },
	{ id: "pr2", employeeName: "Sophie Marchand", payPeriod: "Juillet 2026", baseSalary: "3900.00", overtime: "0.00", bonuses: "200.00", deductions: "580.00", netPay: "3520.00", payDate: daysFromNow(-20) },
	{ id: "pr3", employeeName: "Nadia Belkacem", payPeriod: "Juillet 2026", baseSalary: "3400.00", overtime: "80.00", bonuses: "0.00", deductions: "500.00", netPay: "2980.00", payDate: daysFromNow(-20) },
];

export const seedLeaveRequests = [
	{ id: "lv1", employeeName: "Julien Petit", leaveType: "sick" as const, startDate: daysFromNow(-2), endDate: daysFromNow(1), days: 4, reason: "Grippe", status: "approved" as const },
	{ id: "lv2", employeeName: "Sophie Marchand", leaveType: "vacation" as const, startDate: daysFromNow(20), endDate: daysFromNow(30), days: 11, reason: "Congés d'été", status: "pending" as const },
	{ id: "lv3", employeeName: "Paul Rousseau", leaveType: "personal" as const, startDate: daysFromNow(5), endDate: daysFromNow(5), days: 1, reason: "Rendez-vous administratif", status: "pending" as const },
];

export const seedPerformance = [
	{ id: "perf1", employeeName: "Karim Traoré", reviewPeriod: "Annuel 2025", reviewerName: "Aïcha Ndiaye", overallRating: 5, achievements: "Refonte du programme INF301, taux de réussite en hausse de 12%.", areasForImprovement: "Documentation des supports de cours." },
	{ id: "perf2", employeeName: "Nadia Belkacem", reviewPeriod: "Annuel 2025", reviewerName: "Aïcha Ndiaye", overallRating: 4, achievements: "Campagne portes ouvertes : +30% d'inscriptions.", areasForImprovement: "Suivi budgétaire des campagnes." },
	{ id: "perf3", employeeName: "Julien Petit", reviewPeriod: "Q2 2026", reviewerName: "Karim Traoré", overallRating: 3, achievements: "Migration du parc informatique.", areasForImprovement: "Délais d'intervention sur les tickets." },
];

export const seedInventory = [
	{ id: "inv1", itemName: "Ordinateurs portables (labo INF)", category: "equipment" as const, quantity: 18, unit: "pièces", unitPrice: "890.00", supplier: "TechDistrib", location: "warehouse" as const, minimumStock: 5 },
	{ id: "inv2", itemName: "Ramettes de papier A4", category: "office_supplies" as const, quantity: 40, unit: "boîtes", unitPrice: "4.50", supplier: "Office Plus", location: "office" as const, minimumStock: 20 },
	{ id: "inv3", itemName: "Chaises de bureau ergonomiques", category: "furniture" as const, quantity: 6, unit: "pièces", unitPrice: "120.00", supplier: "MobilierPro", location: "warehouse" as const, minimumStock: 10 },
	{ id: "inv4", itemName: "Vidéoprojecteurs", category: "equipment" as const, quantity: 3, unit: "pièces", unitPrice: "540.00", supplier: "TechDistrib", location: "lab" as const, minimumStock: 4 },
];
