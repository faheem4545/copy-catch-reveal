
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import TextInput from "@/components/plagiarism/TextInput";
import FileUpload from "@/components/plagiarism/FileUpload";
import ResultsDisplay from "@/components/plagiarism/ResultsDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck } from "lucide-react";

// Enhanced mock data with additional source information
const mockSources = [
  {
    url: "https://example.com/article1",
    title: "Understanding Academic Integrity",
    matchPercentage: 65,
    matchedText: "Plagiarism is the act of presenting someone else's work or ideas as your own, with or without their consent, by incorporating it into your work without full acknowledgement.",
    type: "academic" as const,
    publicationDate: "2023-05-12",
    context: "Academic integrity is fundamental to education and research. Plagiarism is the act of presenting someone else's work or ideas as your own, with or without their consent, by incorporating it into your work without full acknowledgement. Institutions worldwide have strict policies against plagiarism."
  },
  {
    url: "https://example.org/research-paper",
    title: "Research Ethics in Modern Academia",
    matchPercentage: 42,
    matchedText: "The consequences of plagiarism can be severe, ranging from failing assignments to expulsion from academic institutions.",
    type: "trusted" as const,
    publicationDate: "2022-11-03"
  },
  {
    url: "https://example.net/blog/writing-tips",
    title: "How to Properly Cite Sources",
    matchPercentage: 28,
    matchedText: "To avoid plagiarism, make sure to provide proper citations for any quotes, paraphrases, or ideas that are not your own.",
    type: "blog" as const,
    publicationDate: "2024-01-15"
  },
  {
    url: "https://example.edu/academic/journal",
    title: "Ethical Writing Practices in Scientific Research",
    matchPercentage: 18,
    matchedText: "Proper citation is not just about avoiding plagiarism—it's about acknowledging the intellectual contributions of others to the academic discourse.",
    type: "academic" as const,
    publicationDate: "2023-09-22",
    context: "The scientific community relies heavily on proper attribution. Proper citation is not just about avoiding plagiarism—it's about acknowledging the intellectual contributions of others to the academic discourse and allowing readers to trace the origin and development of ideas."
  },
];

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [originalText, setOriginalText] = useState("");

  // Handle text submission
  const handleTextSubmit = (text: string) => {
    setIsProcessing(true);
    setOriginalText(text);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 2000);
  };

  // Handle file submission
  const handleFileSelected = (file: File) => {
    // In a real app, this would process the file
    console.log("File selected:", file.name);
    
    // Simulate text extraction and analysis
    setIsProcessing(true);
    
    setTimeout(() => {
      // Mock text extraction from file
      const mockExtractedText = "This is text that would be extracted from the uploaded file. Plagiarism is the act of presenting someone else's work or ideas as your own, with or without their consent, by incorporating it into your work without full acknowledgement.";
      setOriginalText(mockExtractedText);
      setIsProcessing(false);
      setShowResults(true);
    }, 2500);
  };

  // Example function to create highlighted text with React nodes
  const createHighlightedText = () => {
    const parts = originalText.split('.');
    
    return (
      <div>
        {parts.map((part, index) => {
          // Simulate that some sentences are plagiarized
          const isPlagiarized = part.includes("Plagiarism") || part.includes("plagiarism");
          
          return part ? (
            <span 
              key={index} 
              className={isPlagiarized ? "plagiarism-highlight" : ""}
            >
              {part}.
            </span>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <FileCheck className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold mb-3 gradient-text">
            Plagiarism Detection Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Check your text for plagiarism with our advanced NLP-based detection technology
          </p>
        </div>

        {!showResults ? (
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text">Paste Text</TabsTrigger>
              <TabsTrigger value="upload">Upload Document</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <TextInput onSubmit={handleTextSubmit} isProcessing={isProcessing} />
            </TabsContent>
            <TabsContent value="upload">
              <FileUpload onFileSelected={handleFileSelected} />
            </TabsContent>
          </Tabs>
        ) : (
          <ResultsDisplay
            originalText={originalText}
            similarityScore={65}
            sources={mockSources}
            highlightedText={createHighlightedText()}
          />
        )}
      </div>
    </Layout>
  );
};

export default Index;
