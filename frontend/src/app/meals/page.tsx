"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
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

// Pequena amostra da tabela TACO para demonstração
const FOOD_DATABASE = [
  { name: "Arroz integral, cozido", calories: 124, protein: 2.6 }, // por 100g
  { name: "Feijão carioca, cozido", calories: 76, protein: 4.8 },
  { name: "Pão francês", calories: 300, protein: 8.0 },
  { name: "Ovo de galinha, cozido", calories: 155, protein: 13.0 },
  { name: "Peito de frango, grelhado", calories: 159, protein: 32.0 },
  { name: "Banana prata, crua", calories: 89, protein: 1.3 },
  { name: "Alface crespa, crua", calories: 11, protein: 1.3 },
  { name: "Azeite de oliva extra virgem", calories: 884, protein: 0.0 },
  { name: "Carne moída (patinho), cozida", calories: 219, protein: 35.9 },
  { name: "Aveia em flocos", calories: 394, protein: 13.9 },
];

import { UtensilsCrossed, Plus, Flame, Activity, Search, Scale, Trash2 } from "lucide-react";

export default function MealsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [weight, setWeight] = useState(100);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof FOOD_DATABASE>([]);

  async function loadMeals(token: string) {
    const list = await apiRequest<Meal[]>("/api/meals", "GET", undefined, token);
    setMeals(list);
  }

  async function handleDelete(id: number) {
    const token = getToken();
    if (!token) return;
    try {
      await apiRequest(`/api/meals/${id}`, "DELETE", undefined, token);
      showToast("Refeição removida.");
      await loadMeals(token);
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) return router.push("/");
    loadMeals(token).catch(() => {
      showToast("Erro ao carregar refeições.", "error");
      router.push("/");
    });
  }, [router, showToast]);

  // Lógica de busca e sugestão
  useEffect(() => {
    if (name.length > 1) {
      const filtered = FOOD_DATABASE.filter(f => 
        f.name.toLowerCase().includes(name.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [name]);

  const selectFood = (food: typeof FOOD_DATABASE[0]) => {
    setName(food.name);
    calculateMacros(food, weight);
    setSuggestions([]);
  };

  const calculateMacros = (food: typeof FOOD_DATABASE[0] | null, currentWeight: number) => {
    const selected = food || FOOD_DATABASE.find(f => f.name === name);
    if (selected) {
      const ratio = currentWeight / 100;
      setCalories(Math.round(selected.calories * ratio));
      setProtein(Number((selected.protein * ratio).toFixed(1)));
    }
  };

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    calculateMacros(null, newWeight);
  };

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
      setWeight(100);
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
          <p className="text-sm text-slate-500 font-medium">Busque na base oficial TACO ou insira manualmente</p>
        </div>
      </div>

      <Card variant="gradient" className="mb-8 border-slate-800/40">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Input 
                placeholder="Busque um alimento (ex: Pão)" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                icon={<Search size={18} />}
                required
              />
              
              {/* Lista de Sugestões */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl animate-in">
                  {suggestions.map((food) => (
                    <button
                      key={food.name}
                      type="button"
                      onClick={() => selectFood(food)}
                      className="flex w-full flex-col px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                    >
                      <span className="text-sm font-bold text-white">{food.name}</span>
                      <span className="text-[10px] uppercase text-slate-500 font-black">
                        {food.calories} kcal | {food.protein}g proteína (por 100g)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input
              placeholder="Peso (g)"
              type="number"
              value={weight || ""}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              icon={<Scale size={18} />}
              required
            />

            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-slate-950/50 border border-white/5 p-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">Kcal</span>
                <span className="text-sm font-bold text-white">{calories}</span>
              </div>
              <div className="flex-1 rounded-xl bg-slate-950/50 border border-white/5 p-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">Prot (g)</span>
                <span className="text-sm font-bold text-white">{protein}</span>
              </div>
            </div>
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
            <button
              onClick={() => handleDelete(meal.id)}
              className="p-2 text-slate-500 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            >
              <Trash2 size={18} />
            </button>
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
