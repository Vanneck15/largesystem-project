import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  DollarSign,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  Receipt,
  CreditCard,
  TrendingUp,
  Building,
  UserCheck,
  Briefcase,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Moon,
  Sun
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GenericModule } from "@/components/erp/generic-module";
import { db } from "@/lib/erp-data";
import {
  courseConfig,
  examConfig,
  transcriptConfig,
  attendanceConfig,
  invoiceConfig,
  paymentConfig,
  expenseConfig,
  campaignConfig,
  employeeConfig,
  payrollConfig,
  leaveConfig,
  performanceConfig,
  inventoryConfig,
} from "@/lib/module-configs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MODULE_CONFIGS: Record<string, any> = {
  courses: courseConfig,
  exams: examConfig,
  transcripts: transcriptConfig,
  attendance: attendanceConfig,
  invoices: invoiceConfig,
  payments: paymentConfig,
  expenses: expenseConfig,
  campaigns: campaignConfig,
  employees: employeeConfig,
  payroll: payrollConfig,
  leave: leaveConfig,
  performance: performanceConfig,
  inventory: inventoryConfig,
};

const CHART_COLORS = ["#6e3bf0", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'student';
}

interface ERPDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
}

export default function ERPDashboard({ user, token, onLogout }: ERPDashboardProps) {
  const [activeModule, setActiveModule] = useState("overview");
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    invoices: 0,
    employees: 0,
  });
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const { toast } = useToast();

  useEffect(() => {
    // Load initial dashboard stats
    loadDashboardStats();
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("erp.theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
    setIsDark(next);
  };

  const loadDashboardStats = async () => {
    setStats({
      courses: db.courses.getAll().length,
      students: db.users.getAll().filter((u) => u.role === "student").length + 447,
      invoices: db.invoices.getAll().length,
      employees: db.employees.getAll().length,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès.",
    });
    onLogout();
  };

  const getModulesForRole = (role: string) => {
    const baseModules = [
      { id: "overview", name: "Aperçu", icon: Building, color: "bg-blue-500" },
    ];

    const academicModules = [
      { id: "courses", name: "Cours", icon: BookOpen, color: "bg-green-500" },
      { id: "exams", name: "Examens", icon: FileText, color: "bg-purple-500" },
      { id: "transcripts", name: "Relevés de notes", icon: GraduationCap, color: "bg-indigo-500" },
      { id: "attendance", name: "Présences", icon: Calendar, color: "bg-orange-500" },
    ];

    const financeModules = [
      { id: "invoices", name: "Factures", icon: Receipt, color: "bg-yellow-500" },
      { id: "payments", name: "Paiements", icon: CreditCard, color: "bg-emerald-500" },
      { id: "expenses", name: "Dépenses", icon: DollarSign, color: "bg-red-500" },
      { id: "campaigns", name: "Campagnes", icon: TrendingUp, color: "bg-pink-500" },
    ];

    const hrModules = [
      { id: "employees", name: "Employés", icon: Users, color: "bg-slate-500" },
      { id: "payroll", name: "Paie", icon: Briefcase, color: "bg-cyan-500" },
      { id: "leave", name: "Congés", icon: UserCheck, color: "bg-teal-500" },
      { id: "performance", name: "Évaluations", icon: TrendingUp, color: "bg-violet-500" },
      { id: "inventory", name: "Inventaire", icon: Package, color: "bg-amber-500" },
    ];

    switch (role) {
      case 'admin':
        return [...baseModules, ...academicModules, ...financeModules, ...hrModules];
      case 'staff':
        return [...baseModules, ...academicModules, { id: "leave", name: "Congés", icon: UserCheck, color: "bg-teal-500" }];
      case 'student':
        return [
          ...baseModules,
          { id: "courses", name: "Mes cours", icon: BookOpen, color: "bg-green-500" },
          { id: "transcripts", name: "Mes notes", icon: GraduationCap, color: "bg-indigo-500" },
          { id: "attendance", name: "Mes présences", icon: Calendar, color: "bg-orange-500" },
          { id: "invoices", name: "Mes factures", icon: Receipt, color: "bg-yellow-500" },
        ];
      default:
        return baseModules;
    }
  };

  const modules = getModulesForRole(user.role);

  const financeChartData = (() => {
    const payments = db.payments.getAll();
    const expenses = db.expenses.getAll();
    const revenue = payments.reduce((s, p) => s + Number(p.amount), 0);
    const spent = expenses.reduce((s, e) => s + Number(e.amount), 0);
    return [
      { name: "Encaissements", montant: revenue },
      { name: "Dépenses", montant: spent },
      { name: "Solde", montant: revenue - spent },
    ];
  })();

  const invoiceStatusData = (() => {
    const invoices = db.invoices.getAll();
    const counts: Record<string, number> = {};
    invoices.forEach((i) => (counts[i.status] = (counts[i.status] ?? 0) + 1));
    const labels: Record<string, string> = { paid: "Payées", pending: "En attente", overdue: "En retard", cancelled: "Annulées" };
    return Object.entries(counts).map(([status, value]) => ({ name: labels[status] ?? status, value }));
  })();

  const renderOverviewContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bienvenue, {user.name} !</h2>
        <Badge variant="secondary" className="capitalize">
          {user.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'admin' && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total des cours</p>
                    <p className="text-2xl font-bold">{stats.courses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total des étudiants</p>
                    <p className="text-2xl font-bold">{stats.students}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Factures en attente</p>
                    <p className="text-2xl font-bold">{stats.invoices}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total des employés</p>
                    <p className="text-2xl font-bold">{stats.employees}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user.role === 'staff' && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mes cours</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Étudiants inscrits</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user.role === 'student' && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cours suivis</p>
                    <p className="text-2xl font-bold">6</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">GPA actuel</p>
                    <p className="text-2xl font-bold">3.75</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taux de présence</p>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {user.role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Finances — 6 derniers mouvements</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={financeChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} €`} />
                  <Bar dataKey="montant" fill="#6e3bf0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des factures par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={invoiceStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {invoiceStatusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm">Nouveau cours « Architecture logicielle » créé</p>
                <span className="text-xs text-muted-foreground ml-auto">Il y a 2h</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">Paiement reçu de Léa Fontaine</p>
                <span className="text-xs text-muted-foreground ml-auto">Il y a 4h</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm">Nouvelle demande de congé soumise</p>
                <span className="text-xs text-muted-foreground ml-auto">Il y a 6h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="h-12" onClick={() => setActiveModule("invoices")}>
                <FileText className="w-4 h-4 mr-2" />
                Nouvelle facture
              </Button>
              <Button variant="outline" size="sm" className="h-12" onClick={() => setActiveModule("employees")}>
                <Users className="w-4 h-4 mr-2" />
                Ajouter un employé
              </Button>
              <Button variant="outline" size="sm" className="h-12" onClick={() => setActiveModule("courses")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Créer un cours
              </Button>
              <Button variant="outline" size="sm" className="h-12" onClick={() => setActiveModule("exams")}>
                <Calendar className="w-4 h-4 mr-2" />
                Planifier un examen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    if (activeModule === "overview") {
      return renderOverviewContent();
    }

    const config = MODULE_CONFIGS[activeModule];
    if (config) {
      return <GenericModule config={config} />;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold capitalize">{activeModule}</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Module en préparation</h3>
            <p className="text-muted-foreground mb-4">
              Ce module sera disponible prochainement.
            </p>
            <Button variant="outline" onClick={() => setActiveModule("overview")}>
              Retour à l'aperçu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold">ERP Système</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.id}
                  variant={activeModule === module.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveModule(module.id)}
                  data-testid={`nav-${module.id}`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {module.name}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
}