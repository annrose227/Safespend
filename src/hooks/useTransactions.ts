
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  user_id: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: Transaction[] = (data || []).map(item => ({
        id: item.id,
        type: item.type as 'income' | 'expense',
        amount: Number(item.amount),
        category: item.category,
        description: item.description,
        date: item.date,
        user_id: item.user_id
      }));
      
      setTransactions(transformedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id,
          amount: transaction.amount,
          date: new Date(transaction.date).toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match our interface
      const transformedTransaction: Transaction = {
        id: data.id,
        type: data.type as 'income' | 'expense',
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
        user_id: data.user_id
      };

      setTransactions(prev => [transformedTransaction, ...prev]);
      toast({
        title: "Transaction Added",
        description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${transaction.amount} added successfully.`,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions
  };
};
