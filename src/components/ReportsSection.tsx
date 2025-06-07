import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  PieChart,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ReportsSectionProps {
  transactions: Transaction[];
}

export const ReportsSection = ({ transactions }: ReportsSectionProps) => {
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const { toast } = useToast();

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (reportPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate: now };
  };

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, reportPeriod]);

  // Calculate report data
  const reportData = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    // Daily trend data
    const dailyData = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        dailyData[date].income += t.amount;
      } else {
        dailyData[date].expenses += t.amount;
      }
    });

    const dailyTrend = Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      income,
      expenses,
      balance: income - expenses,
      categoryBreakdown,
      dailyTrend,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const exportReport = () => {
    let csvContent = '';
    
    if (reportType === 'summary') {
      csvContent = [
        `Financial Report - ${reportPeriod.toUpperCase()}`,
        `Generated on: ${new Date().toLocaleDateString()}`,
        '',
        'SUMMARY',
        `Total Income: $${reportData.income.toFixed(2)}`,
        `Total Expenses: $${reportData.expenses.toFixed(2)}`,
        `Net Balance: $${reportData.balance.toFixed(2)}`,
        `Transaction Count: ${reportData.transactionCount}`,
        '',
        'CATEGORY BREAKDOWN',
        'Category,Amount',
        ...Object.entries(reportData.categoryBreakdown).map(([cat, amount]: [string, any]) => 
          `${cat},$${amount.toFixed(2)}`
        )
      ].join('\n');
    } else {
      csvContent = [
        'Date,Type,Category,Description,Amount',
        ...filteredTransactions.map(t => 
          `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},"${t.description}",$${t.amount.toFixed(2)}`
        )
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${reportPeriod}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `${reportType} report for ${reportPeriod} has been downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Financial Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Period</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Transactions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export</label>
              <Button onClick={exportReport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${reportData.income.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total Income</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ${reportData.expenses.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <div className="text-center">
              <p className={`text-2xl font-bold ${
                reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${reportData.balance.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Net Balance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {reportData.transactionCount}
              </p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle>Daily Financial Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {reportData.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, '']}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    name="Income"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(reportData.categoryBreakdown)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([category, amount], index) => {
                const percentage = reportData.expenses > 0 ? ((amount as number) / reportData.expenses * 100) : 0;
                return (
                  <div key={category} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {percentage.toFixed(1)}%
                      </Badge>
                      <span className="font-semibold text-red-600">
                        ${(amount as number).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
