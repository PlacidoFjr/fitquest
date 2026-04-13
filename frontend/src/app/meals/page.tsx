"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
}

import { UtensilsCrossed, Plus, Flame, Activity } from "lucide-react";

export default function MealsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [loading, setLoading] = useState(false);

  async function loadMeals(token: string) {
    const list = await apiRequest<Meal[]>("/api/meals", "GET", undefined, token);
    setMeals(list);
  }

  useEffect(() => {
    const token = getToken();
    if (!token) return router.push("/");
    loadMeals(token).catch(() => {
      showToast("Erro ao carregar refeições.", "error");
      router.push("/");
    });
  }, [router, showToast]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      await apiRequest("/api/meals", "POST", { name, calories: Number(calories), protein: Number(protein) }, token);
      setName("");
      setCalories(0);
      setProtein(0);
      await loadMeals(token);
      showToast("Refeição registrada com sucesso!");
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/10 shadow-lg shadow-primary/5">
          <UtensilsCrossed size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Registro de Refeição</h2>
          <p className="text-sm text-slate-500 font-medium">Abasteça seu corpo para a próxima missão</p>
        </div>
      </div>

      <Card variant="gradient" className="mb-8 border-slate-800/40">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Input 
              placeholder="O que você comeu?" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              icon={<UtensilsCrossed size={18} />}
              required
            />
            <Input
              placeholder="Calorias (kcal)"
              type="number"
              value={calories || ""}
              onChange={(e) => setCalories(Number(e.target.value))}
              icon={<Flame size={18} />}
              required
            />
            <Input
              placeholder="Proteína (g)"
              type="number"
              value={protein || ""}
              onChange={(e) => setProtein(Number(e.target.value))}
              icon={<Activity size={18} />}
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading} className="px-8 rounded-2xl">
              <Plus size={18} />
              Registrar Refeição
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-white tracking-tight">Refeições de Hoje</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
          {meals.length} {meals.length === 1 ? 'REGISTRO' : 'REGISTROS'}
        </span>
      </div>

      <div className="grid gap-3">
        {meals.map((meal) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center justify-between rounded-[1.25rem] bg-card/40 border border-slate-800/60 p-4 transition-all hover:bg-slate-800/40 hover:border-slate-700/60"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                <UtensilsCrossed size={18} />
              </div>
              <div>
                <p className="font-bold text-white tracking-tight">{meal.name}</p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                    <span className="text-secondary">{meal.calories}</span> KCAL
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                    <span className="text-primary">{meal.protein}G</span> PROTEÍNA
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {meals.length === 0 && (
          <Card variant="glass" className="py-12 text-center border-dashed border-slate-800">
            <p className="text-slate-500 font-medium">Nenhuma refeição registrada hoje. Que tal começar agora?</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
