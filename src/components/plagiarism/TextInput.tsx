
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, RefreshCw } from "lucide-react";

interface TextInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

const TextInput = ({ onSubmit, isProcessing }: TextInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl">Text Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Textarea
          placeholder="Paste your text here to check for plagiarism..."
          className="min-h-[200px] resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isProcessing}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="flex items-center gap-2" disabled={isProcessing}>
          <FileUp size={16} />
          Upload Document
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={!text.trim() || isProcessing}
        >
          {isProcessing ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Check for Plagiarism"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TextInput;
