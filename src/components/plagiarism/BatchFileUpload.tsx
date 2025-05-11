
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileArchive, FilePlus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

interface BatchFileUploadProps {
  onFilesProcessed: (files: { name: string; content: string }[]) => void;
  maxSizeInMB?: number;
}

const BatchFileUpload: React.FC<BatchFileUploadProps> = ({ onFilesProcessed, maxSizeInMB = 50 }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const maxSizeBytes = maxSizeInMB * 1024 * 1024;
  const supportedFormats = [".txt", ".docx", ".pdf", ".zip"];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Check file size limits
    const oversizedFiles = newFiles.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size limit of ${maxSizeInMB}MB`);
      return;
    }
    
    // Check file formats
    const validFiles = newFiles.filter(file => {
      const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      return supportedFormats.includes(extension) || 
             (extension === ".zip" && file.type === "application/zip");
    });
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Unsupported file format",
        description: `Only ${supportedFormats.join(", ")} files are supported.`,
        variant: "destructive"
      });
    }
    
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setError(null);
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    const processedFiles: { name: string; content: string }[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        
        if (extension === ".zip") {
          // Process ZIP file
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          
          const zipEntries = Object.keys(contents.files).filter(name => 
            !contents.files[name].dir && 
            (name.endsWith(".txt") || name.endsWith(".docx"))
          );
          
          for (let j = 0; j < zipEntries.length; j++) {
            const entryName = zipEntries[j];
            const entryFile = contents.files[entryName];
            
            if (entryName.endsWith(".txt")) {
              const text = await entryFile.async("string");
              processedFiles.push({ name: entryName, content: text });
            } else {
              // For non-text files, we'll need server-side processing
              // This is a placeholder for now
              processedFiles.push({ name: entryName, content: `Content of ${entryName} (would require server-side processing)` });
            }
            
            setProgress(Math.floor(((i + (j + 1) / zipEntries.length) / files.length) * 100));
          }
        } else if (extension === ".txt") {
          // Process text file
          const text = await file.text();
          processedFiles.push({ name: file.name, content: text });
          setProgress(Math.floor(((i + 1) / files.length) * 100));
        } else {
          // For non-text files, we'll need server-side processing
          processedFiles.push({ 
            name: file.name, 
            content: `Content of ${file.name} (would require server-side processing)` 
          });
          setProgress(Math.floor(((i + 1) / files.length) * 100));
        }
      }
      
      onFilesProcessed(processedFiles);
      toast({
        title: "Files processed successfully",
        description: `Processed ${processedFiles.length} files/documents`
      });
      
    } catch (err) {
      console.error("Error processing files:", err);
      setError(`Error processing files: ${err instanceof Error ? err.message : "Unknown error"}`);
      toast({
        title: "Error processing files",
        description: "An error occurred while processing your files.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileArchive className="mr-2 h-5 w-5" />
          Batch File Upload
        </CardTitle>
        <CardDescription>
          Upload multiple files or ZIP archives for plagiarism checking
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
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
          <input
            type="file"
            multiple
            accept=".txt,.docx,.pdf,.zip"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label 
            htmlFor="file-upload" 
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <FilePlus className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: .txt, .docx, .pdf, .zip (max {maxSizeInMB}MB)
            </p>
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700">Selected Files ({files.length})</p>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileArchive className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {isProcessing && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">Processing files... {progress}%</p>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            onClick={() => setFiles([])}
            disabled={files.length === 0 || isProcessing}
          >
            Clear All
          </Button>
          <Button 
            onClick={processFiles}
            disabled={files.length === 0 || isProcessing}
          >
            {isProcessing ? "Processing..." : "Process Files"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BatchFileUpload;
