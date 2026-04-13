"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import TACO_DATABASE from "@/data/taco_database.json";

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  category: string;
}

const FOOD_DATABASE = TACO_DATABASE;

const MEAL_CATEGORIES = [
  { id: 'Café da Manhã', label: 'Café da Manhã', icon: '☕' },
  { id: 'Almoço', label: 'Almoço', icon: '🍲' },
  { id: 'Lanche', label: 'Lanche', icon: '🍎' },
  { id: 'Jantar', label: 'Jantar', icon: '🍽️' },
  { id: 'Ceia', label: 'Ceia', icon: '🌙' },
];

import { UtensilsCrossed, Plus, Search, Scale, Trash2, Flame } from "lucide-react";

export default function MealsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [category, setCategory] = useState("Lanche");
  const [weight, setWeight] = useState(100);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof FOOD_DATABASE>([]);
  const [isCustomRecipe, setIsCustomRecipe] = useState(false);

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
      await apiRequest("/api/meals", "POST", { name, calories: Number(calories), protein: Number(protein), category }, token);
      setName("");
      setCalories(0);
      setProtein(0);
      setWeight(100);
      setCategory("Lanche");
      await loadMeals(token);
      showToast("Refeição registrada com sucesso!");
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Agrupamento de refeições por categoria
  const groupedMeals = MEAL_CATEGORIES.map(cat => ({
    ...cat,
    items: meals.filter(m => m.category === cat.id)
  })).filter(group => group.items.length > 0 || group.id === category);

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
        <div className="flex items-center gap-2 mb-6 p-1 bg-slate-950/50 rounded-xl w-fit border border-white/5">
          <button
            onClick={() => setIsCustomRecipe(false)}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              !isCustomRecipe ? "bg-primary text-primary-foreground shadow-lg" : "text-slate-500 hover:text-white"
            )}
          >
            Buscar Alimento
          </button>
          <button
            onClick={() => {
              setIsCustomRecipe(true);
              setName("");
              setCalories(0);
              setProtein(0);
            }}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              isCustomRecipe ? "bg-primary text-primary-foreground shadow-lg" : "text-slate-500 hover:text-white"
            )}
          >
            Montar Receita
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-1.5 block">
                {isCustomRecipe ? "Nome da Receita" : "Alimento"}
              </label>
              <Input 
                placeholder={isCustomRecipe ? "Ex: Meu Sanduíche Especial" : "Busque um alimento (ex: Pão)"} 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                icon={isCustomRecipe ? <UtensilsCrossed size={18} /> : <Search size={18} />}
                required
              />
              
              {/* Lista de Sugestões - Só aparece no modo busca */}
              {!isCustomRecipe && suggestions.length > 0 && (
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
                        {food.calories} kcal | {Number(food.protein).toFixed(1)}g proteína (por 100g)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isCustomRecipe ? (
              <>
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-1.5 block">Calorias Totais</label>
                  <Input
                    placeholder="0"
                    type="number"
                    value={calories || ""}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    icon={<Flame size={18} />}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-1.5 block">Proteína (g)</label>
                  <Input
                    placeholder="0.0"
                    type="number"
                    step="0.1"
                    value={protein || ""}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    icon={<Scale size={18} />}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-1.5 block">Quantidade</label>
                <Input
                  placeholder="Peso (g)"
                  type="number"
                  value={weight || ""}
                  onChange={(e) => handleWeightChange(Number(e.target.value))}
                  icon={<Scale size={18} />}
                  required
                />
                <span className="absolute right-4 bottom-3 text-[10px] font-black text-slate-500 uppercase pointer-events-none">
                  G
                </span>
              </div>
            )}

            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-1.5 block">Refeição</label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {MEAL_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            {!isCustomRecipe && (
              <div className="flex gap-2 items-end">
                <div className="flex-1 h-11 rounded-xl bg-slate-950/50 border border-white/5 p-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Kcal</span>
                  <span className="text-sm font-bold text-white">{Number(calories).toFixed(0)}</span>
                </div>
                <div className="flex-1 h-11 rounded-xl bg-slate-950/50 border border-white/5 p-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Prot (g)</span>
                  <span className="text-sm font-bold text-white">{Number(protein).toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading} className="px-8 rounded-2xl h-12">
              <Plus size={18} />
              Registrar Refeição
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-black text-white tracking-tight">Refeições de Hoje</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-800">
          {meals.length} {meals.length === 1 ? 'REGISTRO' : 'REGISTROS'}
        </span>
      </div>

      <div className="space-y-8">
        {groupedMeals.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-xl">{group.icon}</span>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">{group.label}</h4>
              <div className="h-px flex-1 bg-slate-800/60 ml-2" />
              {group.items.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-500">
                  {group.items.reduce((acc, curr) => acc + curr.calories, 0).toFixed(0)} kcal
                </Badge>
              )}
            </div>
            
            <div className="grid gap-3">
              {group.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-2xl bg-card/40 border border-slate-800/60 p-4 hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                      <UtensilsCrossed size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">{item.name}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                          <Flame size={10} className="text-amber-500" />
                          {item.calories} kcal
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                          <Scale size={10} className="text-primary" />
                          {item.protein}g proteína
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-500 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
              {group.items.length === 0 && (
                <div className="py-6 text-center border-2 border-dashed border-slate-800/40 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nenhum registro para {group.label}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
