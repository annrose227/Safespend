
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');

      if (error) throw error;

      const budgetMap: Record<string, number> = {};
      data?.forEach(budget => {
        budgetMap[budget.date] = Number(budget.amount);
      });
      
      setBudgets(budgetMap);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (date: string, amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          date,
          amount
        });

      if (error) throw error;

      setBudgets(prev => ({
        ...prev,
        [date]: amount
      }));

      toast({
        title: "Budget Updated",
        description: `Daily budget set to $${amount}`,
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  return {
    budgets,
    loading,
    updateBudget,
    refetch: fetchBudgets
  };
};
