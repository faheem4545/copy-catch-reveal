
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { verifyAllConnections, VerificationResult } from "@/utils/api-verification";

const ApiVerification = () => {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const runVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const verificationResults = await verifyAllConnections();
      setResults(verificationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    runVerification();
  }, []);
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Connection Verification</CardTitle>
        <CardDescription>
          Checking required API keys and services for the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {results.map((result, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              {result.status === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">{result.name}</span>
            </div>
            <div className="text-sm text-gray-500">
              {result.message}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Verifying API connections...</p>
          </div>
        )}
        
        {!isLoading && results.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            No verification results yet
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runVerification} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Verification Again
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiVerification;
