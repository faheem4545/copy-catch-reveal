
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen, Award, AlertTriangle } from 'lucide-react';

interface WritingImprovementProps {
  text: string;
}

export default function WritingImprovement({ text }: WritingImprovementProps) {
  const [activeTab, setActiveTab] = useState('grammar');
  
  // Mock suggestions - in a real app, these would come from an API
  const suggestions = {
    grammar: [
      { type: 'error', text: 'inconsistent use of tense', context: 'The study shows that... The research showed that...' },
      { type: 'warning', text: 'passive voice', context: 'The experiment was conducted by the team.' },
      { type: 'warning', text: 'redundant phrase', context: 'completely eliminate' },
    ],
    style: [
      { type: 'warning', text: 'overly complex sentence', context: 'The implementation of the methodology, which was derived from previous research conducted by Smith et al., was executed with precision and careful attention to the variables that might affect the outcome of the experiment.' },
      { type: 'info', text: 'consider more formal language', context: 'a lot of' },
      { type: 'info', text: 'consider more concise wording', context: 'due to the fact that' },
    ],
    readability: [
      { type: 'info', text: 'Flesch Reading Ease Score', value: '42', explanation: 'Difficult to read. Best understood by college graduates.' },
      { type: 'info', text: 'Average Sentence Length', value: '24 words', explanation: 'Consider breaking up longer sentences.' },
      { type: 'info', text: 'Complex Words', value: '18%', explanation: 'Your text contains a moderate amount of complex words.' },
    ]
  };
  
  // Function to determine the badge color based on suggestion type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" /> 
          Writing Improvement Suggestions
        </CardTitle>
        <CardDescription>
          Get feedback to enhance your writing quality and clarity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grammar" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grammar">Grammar & Usage</TabsTrigger>
            <TabsTrigger value="style">Writing Style</TabsTrigger>
            <TabsTrigger value="readability">Readability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grammar" className="mt-4 space-y-4">
            {suggestions.grammar.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  We found {suggestions.grammar.length} grammar and usage items to review in your text.
                </p>
                
                <div className="space-y-3">
                  {suggestions.grammar.map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(suggestion.type)}`}>
                            {suggestion.type === 'error' ? 'Error' : suggestion.type === 'warning' ? 'Consider revising' : 'Suggestion'}
                          </span>
                          <span className="ml-2 font-medium">{suggestion.text}</span>
                        </div>
                        <Button size="sm" variant="outline">Fix</Button>
                      </div>
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        "{suggestion.context}"
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium">No grammar issues found!</h3>
                <p className="text-muted-foreground mt-2">Your text appears to be grammatically sound.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="style" className="mt-4 space-y-4">
            {suggestions.style.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Here are {suggestions.style.length} suggestions to improve your writing style and clarity.
                </p>
                
                <div className="space-y-3">
                  {suggestions.style.map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(suggestion.type)}`}>
                            {suggestion.type === 'warning' ? 'Consider revising' : 'Suggestion'}
                          </span>
                          <span className="ml-2 font-medium">{suggestion.text}</span>
                        </div>
                        <Button size="sm" variant="outline">Improve</Button>
                      </div>
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        "{suggestion.context}"
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium">Great writing style!</h3>
                <p className="text-muted-foreground mt-2">Your text has a clear and effective writing style.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="readability" className="mt-4 space-y-4">
            <div className="grid gap-4">
              {suggestions.readability.map((metric, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{metric.text}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{metric.explanation}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{metric.value}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-muted/30 rounded-lg mt-2">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Readability Tip</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consider breaking up complex sentences and using more accessible vocabulary to improve readability.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Generate Simplified Version
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
