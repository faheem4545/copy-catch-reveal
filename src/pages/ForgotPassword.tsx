
import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Loader2, AlertCircle, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get the current URL origin to use as the base for the redirect URL
      const origin = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for a link to reset your password.",
        duration: 5000,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      toast({
        title: "Password reset failed",
        description: err.message || "An error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <FileCheck className="h-10 w-10 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  We've sent a password reset link to your email address. Please check your inbox.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || success}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending email...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm text-gray-600 mt-2">
              Remembered your password?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
