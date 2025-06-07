
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface BankStatementUploadProps {
  transactions: Transaction[];
}

export const BankStatementUpload = ({ transactions }: BankStatementUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setUploadedFile(file);
        toast({
          title: "File Uploaded",
          description: `${file.name} uploaded successfully.`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file.",
          variant: "destructive"
        });
      }
    }
  };

  const processStatement = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock bank statement data for demonstration
    const mockBankData = [
      { date: '2024-01-15', description: 'GROCERY STORE', amount: -85.43 },
      { date: '2024-01-16', description: 'SALARY DEPOSIT', amount: 3500.00 },
      { date: '2024-01-17', description: 'GAS STATION', amount: -45.20 },
      { date: '2024-01-18', description: 'RESTAURANT', amount: -32.15 },
    ];

    // Match with existing transactions
    const results = mockBankData.map(bankItem => {
      const matchingTransaction = transactions.find(t => {
        const transactionDate = new Date(t.date).toISOString().split('T')[0];
        const bankDate = bankItem.date;
        const amountMatch = Math.abs(Math.abs(bankItem.amount) - t.amount) < 0.01;
        const dateMatch = transactionDate === bankDate;
        
        return dateMatch && amountMatch;
      });

      return {
        bankItem,
        matchingTransaction,
        status: matchingTransaction ? 'matched' : 'unmatched'
      };
    });

    setMatchResults(results);
    setShowResults(true);
    setIsProcessing(false);

    const matchedCount = results.filter(r => r.status === 'matched').length;
    const unmatchedCount = results.length - matchedCount;

    toast({
      title: "Statement Processed",
      description: `${matchedCount} matched, ${unmatchedCount} unmatched transactions found.`,
    });
  };

  const exportReport = () => {
    const csvContent = [
      'Date,Description,Bank Amount,Status,Your Record',
      ...matchResults.map(result => [
        result.bankItem.date,
        result.bankItem.description,
        result.bankItem.amount,
        result.status,
        result.matchingTransaction ? `$${result.matchingTransaction.amount} - ${result.matchingTransaction.description}` : 'Not found'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank-statement-comparison.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Bank statement comparison report has been downloaded.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Bank Statement Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="statement-file">Upload Bank Statement (CSV format)</Label>
            <Input
              id="statement-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Upload your bank statement in CSV format. Make sure it includes Date, Description, and Amount columns.
            </p>
          </div>

          {uploadedFile && (
            <div className="p-4 border border-border rounded-lg bg-secondary/20">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">{uploadedFile.name}</span>
                <Badge variant="secondary">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              <Button 
                onClick={processStatement} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Compare with Your Records'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {showResults && (
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comparison Results</CardTitle>
            <Button onClick={exportReport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg ${
                    result.status === 'matched' 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' 
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {result.status === 'matched' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {result.bankItem.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.bankItem.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        result.bankItem.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.bankItem.amount > 0 ? '+' : ''}${Math.abs(result.bankItem.amount).toFixed(2)}
                      </p>
                      <Badge variant={result.status === 'matched' ? 'default' : 'destructive'}>
                        {result.status === 'matched' ? 'Matched' : 'Not Found'}
                      </Badge>
                    </div>
                  </div>
                  
                  {result.matchingTransaction && (
                    <div className="mt-2 ml-8 p-2 bg-background/50 rounded text-sm">
                      <span className="text-muted-foreground">Your record: </span>
                      <span className="font-medium">{result.matchingTransaction.description}</span>
                      <span className="text-muted-foreground"> - ${result.matchingTransaction.amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>How to Use Bank Statement Matching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Export from Your Bank</h4>
              <p className="text-sm text-muted-foreground">
                Download your bank statement in CSV format from your online banking portal.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Upload Here</h4>
              <p className="text-sm text-muted-foreground">
                Upload the CSV file using the form above.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Review Matches</h4>
              <p className="text-sm text-muted-foreground">
                Check which transactions match and which ones are missing.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">4. Export Report</h4>
              <p className="text-sm text-muted-foreground">
                Download a detailed comparison report for your records.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
