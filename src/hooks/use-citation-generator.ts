
import { useState } from "react";
import Cite from "citation-js";

export type CitationStyle = "apa" | "mla" | "chicago" | "harvard";

export interface CitationSource {
  title?: string;
  author?: string | string[];
  url?: string;
  date?: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
}

export function useCitationGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCitation = (source: CitationSource, style: CitationStyle = "apa") => {
    setIsGenerating(true);
    try {
      // Create a citation from the source data
      const cite = new Cite(source);
      
      // Format the citation in the requested style
      const citation = cite.format('bibliography', {
        format: 'text',
        template: style,
      });

      setIsGenerating(false);
      return citation;
    } catch (error) {
      console.error("Error generating citation:", error);
      
      // Fallback citation generation if library fails
      setIsGenerating(false);
      return generateFallbackCitation(source, style);
    }
  };

  const generateFallbackCitation = (source: CitationSource, style: CitationStyle): string => {
    const { title, author, url, date, publisher } = source;
    const authorName = Array.isArray(author) ? author.join(", ") : author || "Unknown Author";
    const publicationYear = date ? new Date(date).getFullYear() : "n.d.";
    
    switch (style) {
      case "apa":
        return `${authorName}. (${publicationYear}). ${title || "Untitled"}. ${publisher ? publisher + "." : ""} ${url ? "Retrieved from " + url : ""}`;
      
      case "mla":
        return `${authorName}. "${title || "Untitled"}." ${publisher ? publisher + ", " : ""}${publicationYear}. ${url ? "Web. " : ""}`;
      
      case "chicago":
        return `${authorName}. "${title || "Untitled"}." ${publisher ? publisher + ", " : ""}${publicationYear}. ${url || ""}`;
      
      case "harvard":
        return `${authorName} (${publicationYear}) ${title || "Untitled"}. ${publisher ? publisher + "." : ""} ${url ? "Available at: " + url : ""}`;
      
      default:
        return `${title || "Untitled"} by ${authorName}, ${publicationYear}. ${url || ""}`;
    }
  };

  return {
    generateCitation,
    isGenerating,
  };
}
