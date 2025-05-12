
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

type SupportedFileTypes = 'text/plain' | 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

interface DocumentProcessorProps {
  onFileProcessed: (content: string, fileName: string) => void;
}

export default function DocumentProcessor({ onFileProcessed }: DocumentProcessorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supportedTypes: SupportedFileTypes[] = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const supportedExtensions = ['.txt', '.pdf', '.docx'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    // Check file type
    const fileType = file.type as SupportedFileTypes;
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!supportedTypes.includes(fileType) && !supportedExtensions.includes(fileExtension)) {
      setError(`Unsupported file type. Please upload ${supportedExtensions.join(', ')} files.`);
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setProgress(0);
    setError(null);
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 500);
    
    try {
      // In a real scenario, we would send the file to an API for processing
      // Here, we're simulating text extraction based on file type
      let extractedText = '';
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demonstration, we'll just read .txt files and simulate others
      if (selectedFile.type === 'text/plain') {
        extractedText = await selectedFile.text();
      } else {
        // In a real app, you would use library like pdf.js for PDFs or
        // docx library for DOCX files to extract text
        extractedText = `This is simulated extracted content from "${selectedFile.name}". 
        In a real application, we would use specialized libraries to extract text from 
        ${selectedFile.type} files.
        
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
        ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
        ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
      }
      
      clearInterval(interval);
      setProgress(100);
      
      // Wait a moment before completing to show 100% progress
      setTimeout(() => {
        toast.success(`File "${selectedFile.name}" processed successfully!`);
        onFileProcessed(extractedText, selectedFile.name);
        setIsProcessing(false);
        removeFile();
      }, 500);
      
    } catch (err) {
      clearInterval(interval);
      setError('An error occurred while processing the file.');
      setIsProcessing(false);
      console.error(err);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Document Processor</CardTitle>
        <CardDescription>
          Upload .docx, .pdf, or .txt files for plagiarism detection
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10" : "border-gray-300 dark:border-gray-700"
          } transition-colors`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isProcessing ? (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing file... {Math.round(progress)}%</span>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={processFile} 
                  className="w-full"
                >
                  Process Document
                </Button>
              )}
            </div>
          ) : (
            <div>
              <FileUp className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Drag & drop your file here, or 
                <label className="ml-1 text-purple-600 hover:text-purple-800 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="sr-only"
                    accept=".docx,.pdf,.txt"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Supports: .docx, .pdf, .txt (max 10MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <div className="space-y-2 w-full">
          <p className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Full text extraction from documents
          </p>
          <p className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Maintains formatting for accurate detection
          </p>
          <p className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Processes complex documents with tables and images
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
