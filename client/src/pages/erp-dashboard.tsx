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
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Load initial dashboard stats
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // This would load actual stats from the API
    // For demo purposes, using static values
    setStats({
      courses: 24,
      students: 450,
      invoices: 128,
      employees: 32,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    onLogout();
  };

  const getModulesForRole = (role: string) => {
    const baseModules = [
      { id: "overview", name: "Overview", icon: Building, color: "bg-blue-500" },
    ];

    const academicModules = [
      { id: "courses", name: "Courses", icon: BookOpen, color: "bg-green-500" },
      { id: "exams", name: "Exams", icon: FileText, color: "bg-purple-500" },
      { id: "transcripts", name: "Transcripts", icon: GraduationCap, color: "bg-indigo-500" },
      { id: "attendance", name: "Attendance", icon: Calendar, color: "bg-orange-500" },
    ];

    const financeModules = [
      { id: "invoices", name: "Invoices", icon: Receipt, color: "bg-yellow-500" },
      { id: "payments", name: "Payments", icon: CreditCard, color: "bg-emerald-500" },
      { id: "expenses", name: "Expenses", icon: DollarSign, color: "bg-red-500" },
      { id: "campaigns", name: "Campaigns", icon: TrendingUp, color: "bg-pink-500" },
    ];

    const hrModules = [
      { id: "employees", name: "Employees", icon: Users, color: "bg-slate-500" },
      { id: "payroll", name: "Payroll", icon: Briefcase, color: "bg-cyan-500" },
      { id: "leave", name: "Leave Requests", icon: UserCheck, color: "bg-teal-500" },
      { id: "performance", name: "Performance", icon: TrendingUp, color: "bg-violet-500" },
      { id: "inventory", name: "Inventory", icon: Package, color: "bg-amber-500" },
    ];

    switch (role) {
      case 'admin':
        return [...baseModules, ...academicModules, ...financeModules, ...hrModules];
      case 'staff':
        return [...baseModules, ...academicModules, { id: "leave", name: "Leave Requests", icon: UserCheck, color: "bg-teal-500" }];
      case 'student':
        return [
          ...baseModules,
          { id: "courses", name: "My Courses", icon: BookOpen, color: "bg-green-500" },
          { id: "transcripts", name: "My Grades", icon: GraduationCap, color: "bg-indigo-500" },
          { id: "attendance", name: "My Attendance", icon: Calendar, color: "bg-orange-500" },
          { id: "invoices", name: "My Bills", icon: Receipt, color: "bg-yellow-500" },
        ];
      default:
        return baseModules;
    }
  };

  const modules = getModulesForRole(user.role);

  const renderOverviewContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
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
                    <p className="text-sm font-medium text-muted-foreground">My Courses</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Students Enrolled</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm">New course "Advanced React" created</p>
                <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">Payment received from John Doe</p>
                <span className="text-xs text-muted-foreground ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm">New leave request submitted</p>
                <span className="text-xs text-muted-foreground ml-auto">6 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="h-12">
                <FileText className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button variant="outline" size="sm" className="h-12">
                <Users className="w-4 h-4 mr-2" />
                Add Student
              </Button>
              <Button variant="outline" size="sm" className="h-12">
                <BookOpen className="w-4 h-4 mr-2" />
                Create Course
              </Button>
              <Button variant="outline" size="sm" className="h-12">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Exam
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

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold capitalize">{activeModule}</h2>
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Module Under Development</h3>
            <p className="text-muted-foreground mb-4">
              The {activeModule} module is being built and will be available soon.
            </p>
            <Button variant="outline" onClick={() => setActiveModule("overview")}>
              Back to Overview
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
              <h1 className="text-xl font-bold">ERP System</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
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