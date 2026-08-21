import { db } from "./erp-data";
import type { ModuleConfig } from "@/components/erp/generic-module";

function euro(value: string | number) {
	const n = Number(value);
	return Number.isFinite(n) ? `${n.toFixed(2)} €` : String(value ?? "—");
}

export const courseConfig: ModuleConfig<any> = {
	title: "Cours",
	description: "Catalogue des cours proposés, par semestre et par enseignant.",
	collection: db.courses,
	searchKeys: ["title", "code", "instructor"],
	statusKey: "isActive",
	statusVariants: { true: "bg-emerald-100 text-emerald-800", false: "bg-slate-100 text-slate-700" },
	columns: [
		{ key: "code", label: "Code" },
		{ key: "title", label: "Intitulé" },
		{ key: "credits", label: "Crédits" },
		{ key: "instructor", label: "Enseignant" },
		{ key: "semester", label: "Semestre" },
	],
	fields: [
		{ key: "code", label: "Code du cours", type: "text", required: true, placeholder: "Ex. INF301" },
		{ key: "title", label: "Intitulé", type: "text", required: true },
		{ key: "credits", label: "Crédits", type: "number", required: true },
		{ key: "instructor", label: "Enseignant", type: "text", required: true },
		{ key: "semester", label: "Semestre", type: "text", required: true, placeholder: "Ex. Automne 2026" },
	],
};

export const examConfig: ModuleConfig<any> = {
	title: "Examens",
	description: "Planification des examens : partiels, finaux et quiz.",
	collection: db.exams,
	searchKeys: ["title", "courseCode"],
	statusKey: "examType",
	statusVariants: {
		midterm: "bg-amber-100 text-amber-800",
		final: "bg-red-100 text-red-800",
		quiz: "bg-blue-100 text-blue-800",
	},
	columns: [
		{ key: "title", label: "Titre" },
		{ key: "courseCode", label: "Cours" },
		{ key: "examDate", label: "Date" },
		{ key: "duration", label: "Durée (min)" },
		{ key: "totalMarks", label: "Barème" },
		{ key: "examType", label: "Type" },
	],
	fields: [
		{ key: "title", label: "Titre de l'examen", type: "text", required: true },
		{ key: "courseCode", label: "Code du cours", type: "text", required: true },
		{ key: "examDate", label: "Date", type: "date", required: true },
		{ key: "duration", label: "Durée (minutes)", type: "number", required: true },
		{ key: "totalMarks", label: "Barème (points)", type: "number", required: true },
		{
			key: "examType", label: "Type", type: "select", required: true,
			options: [
				{ label: "Partiel", value: "midterm" },
				{ label: "Final", value: "final" },
				{ label: "Quiz", value: "quiz" },
			],
		},
	],
};

export const transcriptConfig: ModuleConfig<any> = {
	title: "Relevés de notes",
	description: "Notes et moyennes obtenues par les étudiants, par semestre.",
	collection: db.transcripts,
	searchKeys: ["studentName", "courseCode"],
	columns: [
		{ key: "studentName", label: "Étudiant" },
		{ key: "courseCode", label: "Cours" },
		{ key: "grade", label: "Note" },
		{ key: "gpa", label: "GPA" },
		{ key: "semester", label: "Semestre" },
		{ key: "year", label: "Année" },
	],
	fields: [
		{ key: "studentName", label: "Nom de l'étudiant", type: "text", required: true },
		{ key: "courseCode", label: "Code du cours", type: "text", required: true },
		{ key: "grade", label: "Note (lettre)", type: "text", required: true, placeholder: "Ex. A, B+, C" },
		{ key: "gpa", label: "GPA", type: "text", placeholder: "Ex. 3.75" },
		{ key: "semester", label: "Semestre", type: "text", required: true },
		{ key: "year", label: "Année", type: "number", required: true },
	],
};

export const attendanceConfig: ModuleConfig<any> = {
	title: "Présences",
	description: "Suivi de la présence des étudiants, cours par cours.",
	collection: db.attendance,
	searchKeys: ["studentName", "courseCode"],
	statusKey: "status",
	columns: [
		{ key: "studentName", label: "Étudiant" },
		{ key: "courseCode", label: "Cours" },
		{ key: "attendanceDate", label: "Date" },
		{ key: "status", label: "Statut" },
	],
	fields: [
		{ key: "studentName", label: "Nom de l'étudiant", type: "text", required: true },
		{ key: "courseCode", label: "Code du cours", type: "text", required: true },
		{ key: "attendanceDate", label: "Date", type: "date", required: true },
		{
			key: "status", label: "Statut", type: "select", required: true,
			options: [
				{ label: "Présent", value: "present" },
				{ label: "Absent", value: "absent" },
				{ label: "En retard", value: "late" },
			],
		},
	],
};

export const invoiceConfig: ModuleConfig<any> = {
	title: "Factures",
	description: "Factures émises aux étudiants, avec suivi des échéances.",
	collection: db.invoices,
	searchKeys: ["invoiceNumber", "studentName"],
	statusKey: "status",
	columns: [
		{ key: "invoiceNumber", label: "N° facture" },
		{ key: "studentName", label: "Étudiant" },
		{ key: "amount", label: "Montant", render: (r) => euro(r.amount) },
		{ key: "dueDate", label: "Échéance" },
		{ key: "status", label: "Statut" },
	],
	fields: [
		{ key: "invoiceNumber", label: "Numéro de facture", type: "text", required: true, placeholder: "Ex. FAC-2026-0150" },
		{ key: "studentName", label: "Nom de l'étudiant", type: "text", required: true },
		{ key: "amount", label: "Montant (€)", type: "number", required: true },
		{ key: "dueDate", label: "Date d'échéance", type: "date", required: true },
		{ key: "description", label: "Description", type: "textarea" },
		{
			key: "status", label: "Statut", type: "select", required: true,
			options: [
				{ label: "En attente", value: "pending" },
				{ label: "Payée", value: "paid" },
				{ label: "En retard", value: "overdue" },
				{ label: "Annulée", value: "cancelled" },
			],
		},
	],
};

export const paymentConfig: ModuleConfig<any> = {
	title: "Paiements",
	description: "Historique des paiements reçus, rattachés aux factures.",
	collection: db.payments,
	searchKeys: ["invoiceNumber", "transactionId"],
	statusKey: "paymentMethod",
	statusVariants: {
		card: "bg-blue-100 text-blue-800",
		cash: "bg-emerald-100 text-emerald-800",
		bank_transfer: "bg-violet-100 text-violet-800",
	},
	columns: [
		{ key: "invoiceNumber", label: "Facture" },
		{ key: "amount", label: "Montant", render: (r) => euro(r.amount) },
		{ key: "paymentMethod", label: "Moyen" },
		{ key: "transactionId", label: "Transaction" },
		{ key: "paymentDate", label: "Date" },
	],
	fields: [
		{ key: "invoiceNumber", label: "Numéro de facture", type: "text", required: true },
		{ key: "amount", label: "Montant (€)", type: "number", required: true },
		{
			key: "paymentMethod", label: "Moyen de paiement", type: "select", required: true,
			options: [
				{ label: "Carte bancaire", value: "card" },
				{ label: "Espèces", value: "cash" },
				{ label: "Virement", value: "bank_transfer" },
			],
		},
		{ key: "transactionId", label: "ID de transaction", type: "text" },
		{ key: "paymentDate", label: "Date de paiement", type: "date", required: true },
	],
};

export const expenseConfig: ModuleConfig<any> = {
	title: "Dépenses",
	description: "Dépenses de fonctionnement, soumises à validation.",
	collection: db.expenses,
	searchKeys: ["description", "category"],
	statusKey: "status",
	columns: [
		{ key: "description", label: "Description" },
		{ key: "category", label: "Catégorie" },
		{ key: "amount", label: "Montant", render: (r) => euro(r.amount) },
		{ key: "expenseDate", label: "Date" },
		{ key: "status", label: "Statut" },
	],
	fields: [
		{ key: "description", label: "Description", type: "text", required: true },
		{
			key: "category", label: "Catégorie", type: "select", required: true,
			options: [
				{ label: "Charges (électricité, eau…)", value: "utilities" },
				{ label: "Fournitures", value: "supplies" },
				{ label: "Marketing", value: "marketing" },
			],
		},
		{ key: "amount", label: "Montant (€)", type: "number", required: true },
		{ key: "expenseDate", label: "Date", type: "date", required: true },
		{
			key: "status", label: "Statut", type: "select", required: true,
			options: [
				{ label: "En attente", value: "pending" },
				{ label: "Approuvée", value: "approved" },
				{ label: "Rejetée", value: "rejected" },
			],
		},
	],
};

export const campaignConfig: ModuleConfig<any> = {
	title: "Campagnes",
	description: "Campagnes marketing et communication, avec suivi du ROI.",
	collection: db.campaigns,
	searchKeys: ["name", "type"],
	statusKey: "status",
	columns: [
		{ key: "name", label: "Nom" },
		{ key: "type", label: "Type" },
		{ key: "budget", label: "Budget", render: (r) => euro(r.budget) },
		{ key: "startDate", label: "Début" },
		{ key: "roi", label: "ROI (%)" },
		{ key: "status", label: "Statut" },
	],
	fields: [
		{ key: "name", label: "Nom de la campagne", type: "text", required: true },
		{
			key: "type", label: "Type", type: "select", required: true,
			options: [
				{ label: "Email", value: "email" },
				{ label: "Réseaux sociaux", value: "social_media" },
				{ label: "Print", value: "print" },
				{ label: "Digital", value: "digital" },
			],
		},
		{ key: "budget", label: "Budget (€)", type: "number" },
		{ key: "startDate", label: "Date de début", type: "date", required: true },
		{ key: "endDate", label: "Date de fin", type: "date" },
		{ key: "roi", label: "ROI (%)", type: "number" },
		{
			key: "status", label: "Statut", type: "select", required: true,
			options: [
				{ label: "Active", value: "active" },
				{ label: "En pause", value: "paused" },
				{ label: "Terminée", value: "completed" },
			],
		},
	],
};

export const employeeConfig: ModuleConfig<any> = {
	title: "Employés",
	description: "Fiches employés : poste, département et rémunération.",
	collection: db.employees,
	searchKeys: ["name", "position", "department", "employeeId"],
	statusKey: "status",
	columns: [
		{ key: "employeeId", label: "Matricule" },
		{ key: "name", label: "Nom" },
		{ key: "position", label: "Poste" },
		{ key: "department", label: "Département" },
		{ key: "salary", label: "Salaire", render: (r) => euro(r.salary) },
		{ key: "status", label: "Statut" },
	],
	fields: [
		{ key: "employeeId", label: "Matricule", type: "text", required: true, placeholder: "Ex. EMP-006" },
		{ key: "name", label: "Nom complet", type: "text", required: true },
		{ key: "position", label: "Poste", type: "text", required: true },
		{ key: "department", label: "Département", type: "text", required: true },
		{ key: "salary", label: "Salaire mensuel (€)", type: "number", required: true },
		{ key: "hiredAt", label: "Date d'embauche", type: "date", required: true },
		{
			key: "status", label: "Statut", type: "select", required: true,
			options: [
				{ label: "Actif", value: "active" },
				{ label: "Inactif", value: "inactive" },
				{ label: "Fin de contrat", value: "terminated" },
			],
		},
	],
};

export const payrollConfig: ModuleConfig<any> = {
	title: "Paie",
	description: "Bulletins de paie mensuels, calcul du net à payer.",
	collection: db.payroll,
	searchKeys: ["employeeName", "payPeriod"],
	columns: [
		{ key: "employeeName", label: "Employé" },
		{ key: "payPeriod", label: "Période" },
		{ key: "baseSalary", label: "Salaire de base", render: (r) => euro(r.baseSalary) },
		{ key: "bonuses", label: "Primes", render: (r) => euro(r.bonuses) },
		{ key: "deductions", label: "Retenues", render: (r) => euro(r.deductions) },
		{ key: "netPay", label: "Net à payer", render: (r) => euro(r.netPay) },
	],
	fields: [
		{ key: "employeeName", label: "Nom de l'employé", type: "text", required: true },
		{ key: "payPeriod", label: "Période de paie", type: "text", required: true, placeholder: "Ex. Août 2026" },
		{ key: "baseSalary", label: "Salaire de base (€)", type: "number", required: true },
		{ key: "overtime", label: "Heures supplémentaires (€)", type: "number" },
		{ key: "bonuses", label: "Primes (€)", type: "number" },
		{ key: "deductions", label: "Retenues (€)", type: "number" },
		{ key: "netPay", label: "Net à payer (€)", type: "number", required: true },
		{ key: "payDate", label: "Date de versement", type: "date" },
	],
};

export const leaveConfig: ModuleConfig<any> = {
	title: "Congés",
	description: "Demandes de congés du personnel et leur validation.",
	collection: db.leaveRequests,
	searchKeys: ["employeeName", "leaveType"],
	statusKey: "status",
	columns: [
		{ key: "employeeName", label: "Employé" },
		{ key: "leaveType", label: "Type" },
		{ key: "startDate", label: "Début" },
		{ key: "endDate", label: "Fin" },
		{ key: "days", label: "Jours" },
		{ key: "status", label: "Statut" },
	],
	fields: [
		{ key: "employeeName", label: "Nom de l'employé", type: "text", required: true },
		{
			key: "leaveType", label: "Type de congé", type: "select", required: true,
			options: [
				{ label: "Maladie", value: "sick" },
				{ label: "Vacances", value: "vacation" },
				{ label: "Personnel", value: "personal" },
				{ label: "Maternité/Paternité", value: "maternity" },
			],
		},
		{ key: "startDate", label: "Date de début", type: "date", required: true },
		{ key: "endDate", label: "Date de fin", type: "date", required: true },
		{ key: "days", label: "Nombre de jours", type: "number", required: true },
		{ key: "reason", label: "Motif", type: "textarea" },
		{
			key: "status", label: "Statut", type: "select", required: true,
			options: [
				{ label: "En attente", value: "pending" },
				{ label: "Approuvé", value: "approved" },
				{ label: "Rejeté", value: "rejected" },
			],
		},
	],
};

export const performanceConfig: ModuleConfig<any> = {
	title: "Évaluations",
	description: "Évaluations de performance périodiques des employés.",
	collection: db.performance,
	searchKeys: ["employeeName", "reviewPeriod"],
	columns: [
		{ key: "employeeName", label: "Employé" },
		{ key: "reviewPeriod", label: "Période" },
		{ key: "reviewerName", label: "Évaluateur" },
		{ key: "overallRating", label: "Note (/5)" },
	],
	fields: [
		{ key: "employeeName", label: "Nom de l'employé", type: "text", required: true },
		{ key: "reviewPeriod", label: "Période d'évaluation", type: "text", required: true, placeholder: "Ex. Q3 2026" },
		{ key: "reviewerName", label: "Évaluateur", type: "text", required: true },
		{ key: "overallRating", label: "Note globale (1 à 5)", type: "number", required: true },
		{ key: "achievements", label: "Réalisations", type: "textarea" },
		{ key: "areasForImprovement", label: "Axes d'amélioration", type: "textarea" },
	],
};

export const inventoryConfig: ModuleConfig<any> = {
	title: "Inventaire",
	description: "Stock de matériel et fournitures, par emplacement.",
	collection: db.inventory,
	searchKeys: ["itemName", "category", "supplier"],
	columns: [
		{ key: "itemName", label: "Article" },
		{ key: "category", label: "Catégorie" },
		{
			key: "quantity", label: "Quantité",
			render: (r) => (
				<span className={r.quantity <= r.minimumStock ? "text-red-600 font-semibold" : ""}>
					{r.quantity} {r.unit}
				</span>
			),
		},
		{ key: "unitPrice", label: "Prix unitaire", render: (r) => euro(r.unitPrice) },
		{ key: "location", label: "Emplacement" },
		{ key: "supplier", label: "Fournisseur" },
	],
	fields: [
		{ key: "itemName", label: "Nom de l'article", type: "text", required: true },
		{
			key: "category", label: "Catégorie", type: "select", required: true,
			options: [
				{ label: "Fournitures de bureau", value: "office_supplies" },
				{ label: "Équipement", value: "equipment" },
				{ label: "Mobilier", value: "furniture" },
			],
		},
		{ key: "quantity", label: "Quantité", type: "number", required: true },
		{ key: "unit", label: "Unité", type: "text", required: true, placeholder: "Ex. pièces, boîtes, kg" },
		{ key: "unitPrice", label: "Prix unitaire (€)", type: "number" },
		{ key: "supplier", label: "Fournisseur", type: "text" },
		{
			key: "location", label: "Emplacement", type: "select", required: true,
			options: [
				{ label: "Entrepôt", value: "warehouse" },
				{ label: "Bureau", value: "office" },
				{ label: "Laboratoire", value: "lab" },
			],
		},
		{ key: "minimumStock", label: "Stock minimum (alerte)", type: "number" },
	],
};
