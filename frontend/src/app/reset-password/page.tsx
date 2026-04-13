"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { apiRequest } from "@/lib/api";
import { Dumbbell, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showToast("As senhas não coincidem.", "error");
    }
    if (!token) {
      return showToast("Token de recuperação ausente.", "error");
    }

    setLoading(true);
    try {
      await apiRequest("/api/auth/reset-password", "POST", { token, newPassword: password });
      setSuccess(true);
      showToast("Senha alterada com sucesso!");
      setTimeout(() => router.push("/"), 3000);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center animate-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="mb-2 text-xl font-black text-white">Senha Redefinida!</h3>
        <p className="mb-8 text-sm text-slate-400 font-medium">
          Sua senha foi atualizada. Você será redirecionado para o login em instantes.
        </p>
        <Button onClick={() => router.push("/")} className="w-full">Ir para o Login agora</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in">
      <h3 className="mb-2 text-xl font-black text-white text-center">Nova Senha</h3>
      <p className="mb-8 text-sm text-slate-400 font-medium text-center">
        Crie uma senha forte para proteger sua conta.
      </p>

      <Input
        placeholder="Nova senha secreta"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock size={18} />}
        required
      />
      <Input
        placeholder="Confirme a nova senha"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        icon={<Lock size={18} />}
        required
      />
      
      <Button 
        className="w-full h-12 text-base font-black rounded-2xl shadow-2xl shadow-primary/20" 
        type="submit"
        loading={loading}
      >
        Redefinir Senha
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 selection:bg-primary/30 selection:text-primary-foreground">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="z-10 w-full max-w-[420px]"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-primary to-emerald-500 text-white shadow-2xl shadow-primary/30">
            <Dumbbell size={32} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Fit<span className="text-primary">Quest</span>
          </h1>
        </div>

        <Card variant="glass" className="p-8 border-white/5 backdrop-blur-xl">
          <Suspense fallback={<div className="text-center text-slate-400">Carregando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </motion.div>
    </div>
  );
}
