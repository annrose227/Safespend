
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign,
  Target,
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

interface CalendarBudgetProps {
  transactions: Transaction[];
  budgets: Record<string, number>;
  onUpdateBudget: (date: string, amount: number) => void;
}

export const CalendarBudget = ({ transactions, budgets, onUpdateBudget }: CalendarBudgetProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  // Calculate daily expenses
  const dailyExpenses = useMemo(() => {
    const expenses: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date).toISOString().split('T')[0];
        expenses[date] = (expenses[date] || 0) + t.amount;
      });
    return expenses;
  }, [transactions]);

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayStatus = (date: Date) => {
    const dateStr = formatDate(date);
    const expense = dailyExpenses[dateStr] || 0;
    const budget = budgets[dateStr] || 0;
    
    if (budget === 0) return 'no-budget';
    if (expense > budget) return 'over-budget';
    if (expense > budget * 0.8) return 'near-budget';
    return 'under-budget';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over-budget': return 'bg-red-500 text-white';
      case 'near-budget': return 'bg-yellow-500 text-white';
      case 'under-budget': return 'bg-green-500 text-white';
      default: return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setBudgetAmount((budgets[dateStr] || 0).toString());
  };

  const handleBudgetUpdate = () => {
    if (selectedDate && budgetAmount) {
      onUpdateBudget(selectedDate, parseFloat(budgetAmount));
      setSelectedDate(null);
      setBudgetAmount('');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const calendarDays = getCalendarDays();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Budget Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dateStr = formatDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = dateStr === today;
              const status = getDayStatus(day);
              const expense = dailyExpenses[dateStr] || 0;
              const budget = budgets[dateStr] || 0;

              return (
                <div
                  key={index}
                  className={`
                    relative p-2 min-h-[80px] border border-border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {day.getDate()}
                    </span>
                    {isCurrentMonth && budget > 0 && (
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                    )}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="space-y-1">
                      {budget > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Budget: ${budget.toFixed(0)}
                        </div>
                      )}
                      {expense > 0 && (
                        <div className={`text-xs font-medium ${
                          status === 'over-budget' ? 'text-red-600' : 'text-foreground'
                        }`}>
                          Spent: ${expense.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Setting Modal */}
      {selectedDate && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Set Budget for {new Date(selectedDate).toLocaleDateString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget-amount">Daily Budget</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="budget-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-end space-x-2">
                <Button onClick={handleBudgetUpdate} className="flex-1">
                  Set Budget
                </Button>
                <Button variant="outline" onClick={() => setSelectedDate(null)}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Current day info */}
            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Budget</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${(budgets[selectedDate] || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Expenses Today</p>
                  <p className="text-lg font-semibold text-red-600">
                    ${(dailyExpenses[selectedDate] || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-lg font-semibold ${
                    (budgets[selectedDate] || 0) - (dailyExpenses[selectedDate] || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ${((budgets[selectedDate] || 0) - (dailyExpenses[selectedDate] || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Budget Status Legend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm">Under Budget</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Near Budget (80%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">Over Budget</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gray-400" />
              <span className="text-sm">No Budget Set</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
