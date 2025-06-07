
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface DashboardProps {
  transactions: Transaction[];
  budgets: Record<string, number>;
}

export const Dashboard = ({ transactions, budgets }: DashboardProps) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  // Calculate summary statistics
  const summary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.split('T')[0] === today)
      .reduce((sum, t) => sum + t.amount, 0);

    const weekExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.split('T')[0] >= weekStart)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.split('T')[0] >= monthStart)
      .reduce((sum, t) => sum + t.amount, 0);

    const todayBudget = budgets[today] || 0;
    const budgetStatus = todayBudget > 0 ? (todayExpenses > todayBudget ? 'over' : 'under') : 'none';

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      todayExpenses,
      weekExpenses,
      monthExpenses,
      todayBudget,
      budgetStatus
    };
  }, [transactions, budgets]);

  // Prepare expense category data for pie chart
  const categoryData = useMemo(() => {
    const categories = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Prepare monthly trend data
  const monthlyTrend = useMemo(() => {
    const months = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!months[month]) {
        months[month] = { month, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        months[month].income += t.amount;
      } else {
        months[month].expenses += t.amount;
      }
    });

    return Object.values(months).slice(-6); // Last 6 months
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summary.budgetStatus === 'over' ? 'text-red-600' : 'text-foreground'
            }`}>
              ${summary.todayExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Budget: ${summary.todayBudget.toFixed(2)}
              {summary.budgetStatus === 'over' && (
                <span className="text-red-600 ml-1">⚠️ Over budget</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${summary.weekExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${summary.monthExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Pie Chart */}
        <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No expense data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, '']} />
                    <Legend />
                    <Bar dataKey="income" fill="#82ca9d" name="Income" />
                    <Bar dataKey="expenses" fill="#8884d8" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Start by adding your first transaction!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
