import { useState } from "react";
import { useLocation } from "wouter";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const loginMutation = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          login(data.token);
          toast({ title: "Welcome back Admin!" });
          setLocation("/admin");
        },
        onError: () => {
          toast({ title: "Login Failed", description: "Invalid credentials", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')]" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl border border-border/10">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
          <Lock className="h-8 w-8 text-primary-foreground" />
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to EXAMCORE PULSE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
            <Input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-muted/50" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Password</label>
            <Input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-muted/50" 
              required 
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/25"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Authenticating..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
