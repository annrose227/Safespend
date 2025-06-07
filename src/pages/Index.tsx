
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { Dashboard } from '@/components/Dashboard';
import { TransactionForm } from '@/components/TransactionForm';
import { BankStatementUpload } from '@/components/BankStatementUpload';
import { ReportsSection } from '@/components/ReportsSection';
import { CalendarBudget } from '@/components/CalendarBudget';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { transactions, addTransaction } = useTransactions();
  const { budgets, updateBudget } = useBudgets();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budgets={budgets} />;
      case 'add-transaction':
        return <TransactionForm onAddTransaction={addTransaction} />;
      case 'bank-upload':
        return <BankStatementUpload transactions={transactions} />;
      case 'reports':
        return <ReportsSection transactions={transactions} />;
      case 'budget-calendar':
        return <CalendarBudget transactions={transactions} budgets={budgets} onUpdateBudget={updateBudget} />;
      default:
        return <Dashboard transactions={transactions} budgets={budgets} />;
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {activeSection === 'dashboard' && <HeroSection setActiveSection={setActiveSection} />}
      
      <main className="container mx-auto px-4 py-8">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default Index;
