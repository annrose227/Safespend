
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  TrendingUp, 
  PieChart, 
  Download, 
  CreditCard,
  Plus,
  ArrowRight
} from 'lucide-react';

interface HeroSectionProps {
  setActiveSection: (section: string) => void;
}

export const HeroSection = ({ setActiveSection }: HeroSectionProps) => {
  const features = [
    {
      icon: Calendar,
      title: "Daily Expense",
      description: "Track your daily spending habits",
      action: () => setActiveSection('add-transaction'),
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: TrendingUp,
      title: "Weekly Review",
      description: "Analyze your weekly financial patterns",
      action: () => setActiveSection('reports'),
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: PieChart,
      title: "Monthly Overview",
      description: "Get comprehensive monthly insights",
      action: () => setActiveSection('reports'),
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Download,
      title: "Report Downloading",
      description: "Export your financial reports",
      action: () => setActiveSection('reports'),
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: CreditCard,
      title: "Bank Statement Comparing",
      description: "Match your records with bank statements",
      action: () => setActiveSection('bank-upload'),
      color: "text-red-600 dark:text-red-400"
    },
    {
      icon: Calendar,
      title: "Budget Calendar",
      description: "Visual budget tracking with alerts",
      action: () => setActiveSection('budget-calendar'),
      color: "text-indigo-600 dark:text-indigo-400"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16">
      <div className="container mx-auto px-4">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Master Your{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Household Finances
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Track income and expenses, match bank statements, and stay on budget with intelligent alerts and beautiful visual reports.
          </p>
          <Button 
            size="lg" 
            onClick={() => setActiveSection('add-transaction')}
            className="animate-fade-in hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Tracking Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover-scale animate-fade-in border-border/50 hover:border-primary/20"
                onClick={feature.action}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-background ${feature.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
