import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login as mockLogin, type AuthUser } from "@/lib/mock-auth";

interface LoginFormProps {
  onLogin: (token: string, user: any) => void;
  onShowRegister: () => void;
}

interface LoginResponse {
  user: AuthUser;
  token: string;
}

export default function LoginForm({ onLogin, onShowRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }): Promise<LoginResponse> => {
      return mockLogin(email, password);
    },
    onSuccess: (data) => {
      toast({
        title: "Connexion réussie",
        description: `Bon retour, ${data.user.name} !`,
      });
      onLogin(data.token, data.user);
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de connexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Merci de renseigner un email et un mot de passe",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Connexion au système ERP</CardTitle>
          <CardDescription>
            Accédez à votre tableau de bord académique, financier et RH
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {loginMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {loginMutation.error?.message || "Une erreur est survenue lors de la connexion"}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion en cours…</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={onShowRegister}
                data-testid="button-show-register"
              >
                Créer un compte
              </Button>
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
            <p className="text-xs font-medium text-muted-foreground text-center">Comptes de démonstration (mot de passe : demo123)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Admin", email: "admin@erp.com" },
                { label: "Staff", email: "staff@erp.com" },
                { label: "Étudiant", email: "student@erp.com" },
              ].map((acc) => (
                <Button
                  key={acc.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword("demo123");
                  }}
                >
                  {acc.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}