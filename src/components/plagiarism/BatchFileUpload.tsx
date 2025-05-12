
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, AlertOctagon, CheckCircle } from "lucide-react";
import { useBatchProcessing } from "@/hooks/use-batch-processing";
import JSZip from "jszip";

interface BatchFileUploadProps {
  onBatchProcessingComplete?: (results: any[]) => void;
  userId?: string;
  onFilesProcessed?: (files: { name: string; content: string }[]) => void;
}

const BatchFileUpload: React.FC<BatchFileUploadProps> = ({ 
  onBatchProcessingComplete,
  userId,
  onFilesProcessed 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { processBatch, isProcessing, progress } = useBatchProcessing();

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Reset previous selections
    setSelectedFiles([]);
    
    const filesToProcess: File[] = [];
    
    // Check for ZIP files
    const zipFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.zip'));
    const nonZipFiles = Array.from(files).filter(file => !file.name.toLowerCase().endsWith('.zip'));
    
    // Add non-ZIP files directly
    filesToProcess.push(...nonZipFiles);
    
    // Process ZIP files
    try {
      for (const zipFile of zipFiles) {
        toast.info(`Extracting files from ${zipFile.name}...`);
        
        const zip = new JSZip();
        const zipContents = await zip.loadAsync(zipFile);
        
        const extractionPromises: Promise<void>[] = [];
        
        zipContents.forEach((path, file) => {
          if (!file.dir && path.endsWith('.txt') || path.endsWith('.md') || path.endsWith('.doc') || path.endsWith('.docx')) {
            const promise = file.async('blob')
              .then(blob => {
                const extractedFile = new File([blob], path, { type: 'text/plain' });
                filesToProcess.push(extractedFile);
              });
            
            extractionPromises.push(promise);
          }
        });
        
        await Promise.all(extractionPromises);
      }
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      toast.error('Failed to extract ZIP file contents');
    }
    
    setSelectedFiles(filesToProcess);
    
    if (filesToProcess.length === 0) {
      toast.warning('No valid text files found for processing');
    } else {
      toast.success(`${filesToProcess.length} files ready for processing`);
    }
  };

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Please select files to process first');
      return;
    }
    
    try {
      // Prepare the batch by reading file contents
      const fileContents = await Promise.all(
        selectedFiles.map(async (file) => {
          return new Promise<{ name: string; content: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ 
                name: file.name, 
                content: typeof reader.result === 'string' ? reader.result : '' 
              });
            };
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsText(file);
          });
        })
      );
      
      // Process the batch
      const results = await processBatch(fileContents, userId);

      // Pass the file contents to parent component if onFilesProcessed is provided
      if (onFilesProcessed) {
        onFilesProcessed(fileContents);
      }
      
      if (results.length > 0) {
        if (onBatchProcessingComplete) {
          onBatchProcessingComplete(results);
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('An error occurred while processing files');
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Batch File Upload
        </CardTitle>
        <CardDescription>
          Upload multiple files or ZIP archives for plagiarism analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to select files or drag and drop
              <br />
              Text files (.txt, .md) and ZIP archives supported
            </p>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden"
              multiple
              accept=".txt,.md,.zip,.doc,.docx"
              onChange={handleFileSelection}
              disabled={isProcessing}
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-2">{selectedFiles.length} files selected:</p>
              <ul className="max-h-24 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-xs text-gray-600">{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing files...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSelectedFiles([]);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            disabled={selectedFiles.length === 0 || isProcessing}
          >
            <AlertOctagon className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={handleProcessFiles}
            disabled={selectedFiles.length === 0 || isProcessing}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Process Files
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BatchFileUpload;
