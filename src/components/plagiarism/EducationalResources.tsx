
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, FileText, FileCheck, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function EducationalResources() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
          Academic Resources
        </CardTitle>
        <CardDescription>
          Improve your academic writing and avoid plagiarism
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="citation">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="citation">Citation Guide</TabsTrigger>
            <TabsTrigger value="plagiarism">About Plagiarism</TabsTrigger>
            <TabsTrigger value="writing">Writing Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="citation" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <h4 className="text-lg font-medium">Common Citation Styles</h4>
              <p className="text-muted-foreground text-sm">
                Proper citation is essential for academic integrity. Here's how to cite in common formats:
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="apa">
                <AccordionTrigger>APA Style (7th Edition)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <h5 className="font-medium">Book Format:</h5>
                    <p className="text-sm pl-4">
                      Author, A. A. (Year of publication). <em>Title of work: Capital letter also for subtitle</em>. Publisher.
                    </p>
                    
                    <h5 className="font-medium">Journal Article Format:</h5>
                    <p className="text-sm pl-4">
                      Author, A. A., & Author, B. B. (Year). Title of article. <em>Title of Journal</em>, volume(issue), page range. DOI
                    </p>
                    
                    <h5 className="font-medium">Website Format:</h5>
                    <p className="text-sm pl-4">
                      Author, A. A. (Year, Month Day). Title of page. Site name. URL
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="mla">
                <AccordionTrigger>MLA Style (9th Edition)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <h5 className="font-medium">Book Format:</h5>
                    <p className="text-sm pl-4">
                      Last Name, First Name. <em>Title of Book</em>. Publisher, Year of publication.
                    </p>
                    
                    <h5 className="font-medium">Journal Article Format:</h5>
                    <p className="text-sm pl-4">
                      Last Name, First Name. "Title of Article." <em>Title of Journal</em>, Volume, Issue, Year, pages.
                    </p>
                    
                    <h5 className="font-medium">Website Format:</h5>
                    <p className="text-sm pl-4">
                      Last Name, First Name. "Title of Web Page." <em>Title of Website</em>, Publisher, Date of publication, URL. Accessed Day Month Year.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="chicago">
                <AccordionTrigger>Chicago Style (17th Edition)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <h5 className="font-medium">Book Format (Notes):</h5>
                    <p className="text-sm pl-4">
                      First Name Last Name, <em>Title of Book</em> (Place of publication: Publisher, Year), page number.
                    </p>
                    
                    <h5 className="font-medium">Journal Article Format (Notes):</h5>
                    <p className="text-sm pl-4">
                      First Name Last Name, "Title of Article," <em>Title of Journal</em> Volume, no. Issue (Year): page range.
                    </p>
                    
                    <h5 className="font-medium">Website Format (Notes):</h5>
                    <p className="text-sm pl-4">
                      First Name Last Name, "Title of Web Page," <em>Title of Website</em>, Publisher, publication date or modification date, URL.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Download Complete Citation Guide
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="plagiarism" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <h4 className="text-lg font-medium">Understanding Plagiarism</h4>
              <p className="text-muted-foreground text-sm">
                Plagiarism is presenting someone else's work or ideas as your own, with or without their consent,
                by incorporating it into your work without full acknowledgment.
              </p>
            </div>
            
            <div className="grid gap-3">
              <div className="p-3 border rounded-lg">
                <h5 className="font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  Direct Plagiarism
                </h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Copying another person's work word for word without proper citation.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h5 className="font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  Self-Plagiarism
                </h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Reusing your own previously submitted or published work without proper citation.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h5 className="font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  Mosaic Plagiarism
                </h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Borrowing phrases from a source without using quotation marks, or finding synonyms for the author's language while keeping the same structure.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h5 className="font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  Accidental Plagiarism
                </h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Forgetting to cite sources, misquoting sources, or unintentionally paraphrasing without proper attribution.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="writing" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <h4 className="text-lg font-medium">Academic Writing Tips</h4>
              <p className="text-muted-foreground text-sm">
                Improve your academic writing with these best practices:
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="clarity">
                <AccordionTrigger>Write with Clarity and Precision</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Use clear, concise language that communicates your ideas effectively.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Avoid jargon unless it's necessary for your discipline.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Define technical terms when first introduced.</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="structure">
                <AccordionTrigger>Develop Strong Structure</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Begin with an outline to organize your thoughts.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Use topic sentences to guide your paragraphs.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Ensure logical flow between paragraphs and sections.</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="evidence">
                <AccordionTrigger>Support Claims with Evidence</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Back up your arguments with credible sources.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Integrate quotes smoothly into your text.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Analyze evidence rather than just presenting it.</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="revise">
                <AccordionTrigger>Revise and Edit Thoroughly</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Allow time between writing and revising for perspective.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Read your work aloud to catch awkward phrasing.</span>
                    </li>
                    <li className="flex">
                      <FileCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Get peer feedback when possible.</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <BookOpen className="h-4 w-4 mr-2" />
          View Library Resources
        </Button>
        <Button>
          <GraduationCap className="h-4 w-4 mr-2" />
          Access Writing Workshop
        </Button>
      </CardFooter>
    </Card>
  );
}
