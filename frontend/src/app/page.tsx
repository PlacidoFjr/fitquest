"use client";

import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { apiRequest } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { cn } from "@/lib/cn";

import { Dumbbell, Mail, Lock, Sparkles, KeyRound, ArrowLeft } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.push("/dashboard");
  }, [router]);

  // Inicializa Google Login
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google && mode !== "forgot") {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          setLoading(true);
          try {
            const data = await apiRequest<{ token: string }>("/api/auth/google", "POST", {
              credential: response.credential,
            });
            setToken(data.token);
            showToast("Acesso autorizado via Google!");
            router.push("/dashboard");
          } catch (e) {
            showToast("Falha ao entrar com Google", "error");
          } finally {
            setLoading(false);
          }
        },
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%", shape: "pill" }
      );
    }
  }, [mode, router, showToast]);

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("/api/auth/forgot-password", "POST", { email });
      showToast("Verifique seu e-mail para recuperar a senha.");
      setMode("login");
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await apiRequest<{ token: string }>(endpoint, "POST", { email, password });
      setToken(data.token);
      showToast(mode === "login" ? "Acesso autorizado. Bem-vindo!" : "Conta criada com sucesso.");
      router.push("/dashboard");
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 selection:bg-primary/30 selection:text-primary-foreground">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="z-10 w-full max-w-[420px]"
      >
        <div className="mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-primary to-emerald-500 text-white shadow-2xl shadow-primary/30"
          >
            <Dumbbell size={32} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Fit<span className="text-primary">Quest</span>
          </h1>
          <p className="mt-3 text-slate-400 font-medium tracking-tight">
            {mode === "forgot" ? "Recupere sua jornada épica" : "Transforme sua disciplina em conquistas épicas"}
          </p>
        </div>

        <Card variant="glass" className="p-8 border-white/5 backdrop-blur-xl">
          {mode !== "forgot" ? (
            <>
              <div className="flex p-1 mb-8 rounded-2xl bg-slate-950/50 border border-white/5">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-black rounded-xl transition-all duration-300",
                    mode === "login" ? "bg-primary text-primary-foreground shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-black rounded-xl transition-all duration-300",
                    mode === "register" ? "bg-primary text-primary-foreground shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Cadastro
                </button>
              </div>

              <form className="space-y-5" onSubmit={submit}>
                <Input
                  placeholder="Seu melhor email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />
                <Input
                  placeholder="Sua senha secreta"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  required
                />
                
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <Button 
                  className="w-full h-12 text-base font-black rounded-2xl shadow-2xl shadow-primary/20 mt-2" 
                  type="submit"
                  loading={loading}
                >
                  {mode === "login" ? "Entrar na Arena" : "Iniciar Minha Jornada"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs font-black uppercase">
                    <span className="bg-[#0f172a] px-4 text-slate-500">Ou continue com</span>
                  </div>
                </div>

                <div id="googleBtn" className="w-full min-h-[44px]"></div>
              </form>
            </>
          ) : (
            <div className="animate-in">
              <button 
                onClick={() => setMode("login")}
                className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Voltar ao Login
              </button>
              
              <h3 className="mb-2 text-xl font-black text-white">Esqueceu a senha?</h3>
              <p className="mb-8 text-sm text-slate-400 font-medium">
                Insira seu e-mail abaixo para receber as instruções de recuperação.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <Input
                  placeholder="Seu email cadastrado"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />
                <Button 
                  className="w-full h-12 text-base font-black rounded-2xl shadow-2xl shadow-primary/20" 
                  type="submit"
                  loading={loading}
                >
                  <KeyRound size={18} /> Enviar Link
                </Button>
              </form>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
