
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  Sun, 
  Home, 
  Plus, 
  Upload, 
  FileText, 
  Calendar,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Header = ({ activeSection, setActiveSection }: HeaderProps) => {
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-transaction', label: 'Add Transaction', icon: Plus },
    { id: 'bank-upload', label: 'Bank Upload', icon: Upload },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'budget-calendar', label: 'Budget Calendar', icon: Calendar },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 transition-colors duration-300 backdrop-blur-md bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-primary-foreground font-bold text-sm">FT</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              FinanceTracker
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection(item.id)}
                  className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="transition-all duration-200 hover:scale-105">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 transition-all duration-200 hover:scale-105">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden transition-all duration-200 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-start space-x-2 w-full transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
