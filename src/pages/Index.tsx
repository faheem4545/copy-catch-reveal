
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import TextInput from "@/components/plagiarism/TextInput";
import FileUpload from "@/components/plagiarism/FileUpload";
import ResultsDisplay from "@/components/plagiarism/ResultsDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Initial mock sources (will be replaced with real ones)
const initialMockSources = [
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

interface Source {
  url: string;
  title: string;
  matchPercentage: number;
  matchedText: string;
  type: "academic" | "trusted" | "blog" | "unknown";
  publicationDate?: string;
  context?: string;
}

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [sources, setSources] = useState<Source[]>(initialMockSources);
  const [isSearchingSources, setIsSearchingSources] = useState(false);

  // Function to find real sources for detected plagiarism
  const findRealSources = async (text: string) => {
    try {
      setIsSearchingSources(true);
      
      // Break text into sentences for more precise matching
      const sentences = text.split(/[.!?]+/).filter(sentence => 
        sentence.trim().split(" ").length > 5
      );
      
      // Select the most significant sentences for searching
      const searchQueries = sentences.slice(0, 3).map(s => s.trim());
      
      const searchPromises = searchQueries.map(async (query) => {
        try {
          const { data, error } = await supabase.functions.invoke('search-sources', {
            body: { query }
          });
          
          if (error) {
            console.error("Error searching sources:", error);
            return [];
          }
          
          return data.sources.map((source: any, index: number) => ({
            url: source.url,
            title: source.title,
            matchPercentage: Math.floor(Math.random() * 40) + 25, // Simulated match percentage between 25-65
            matchedText: query,
            type: source.type,
            publicationDate: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString().split('T')[0], // Random date within last year
            context: source.snippet
          }));
        } catch (err) {
          console.error("Error in search promise:", err);
          return [];
        }
      });
      
      // Wait for all searches to complete
      const searchResults = await Promise.all(searchPromises);
      
      // Flatten results and take up to 5 unique sources
      const flattenedResults = Array.from(
        new Map(
          searchResults.flat().map(item => [item.url, item])
        ).values()
      ).slice(0, 5);
      
      if (flattenedResults.length > 0) {
        setSources(flattenedResults);
        toast.success(`Found ${flattenedResults.length} matching sources`);
      } else {
        toast.info("No matching sources found. Using sample data.");
      }
    } catch (error) {
      console.error("Error finding sources:", error);
      toast.error("Failed to find matching sources.");
    } finally {
      setIsSearchingSources(false);
    }
  };

  // Handle text submission
  const handleTextSubmit = async (text: string) => {
    setIsProcessing(true);
    setOriginalText(text);
    
    // Simulate API call delay
    setTimeout(async () => {
      setIsProcessing(false);
      setShowResults(true);
      
      // Search for real sources after showing initial results
      findRealSources(text);
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
      
      // Search for real sources
      findRealSources(mockExtractedText);
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
            sources={sources}
            highlightedText={createHighlightedText()}
            isSearchingSources={isSearchingSources}
          />
        )}
      </div>
    </Layout>
  );
};

export default Index;
