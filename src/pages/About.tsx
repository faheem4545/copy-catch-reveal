
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Search, FileCheck, Zap, Globe } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Search className="h-10 w-10 text-purple-600" />,
      title: "Advanced Detection",
      description: "Our algorithm compares your text against billions of web pages, academic papers, and publications."
    },
    {
      icon: <Zap className="h-10 w-10 text-purple-600" />,
      title: "Real-time Results",
      description: "Get instant plagiarism analysis with highlighted text and source links in seconds."
    },
    {
      icon: <FileCheck className="h-10 w-10 text-purple-600" />,
      title: "Multiple Formats",
      description: "Support for various document formats including .docx, .pdf, and .txt files."
    },
    {
      icon: <Database className="h-10 w-10 text-purple-600" />,
      title: "Report History",
      description: "Access your past plagiarism reports from your personalized dashboard."
    },
    {
      icon: <Shield className="h-10 w-10 text-purple-600" />,
      title: "Privacy First",
      description: "Your documents remain private and secure. We never share or store your content."
    },
    {
      icon: <Globe className="h-10 w-10 text-purple-600" />,
      title: "API Access",
      description: "Integrate our plagiarism detection technology into your own applications."
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 gradient-text">About Our Tool</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cutting-edge plagiarism detection for students, educators, and content creators
          </p>
        </div>

        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our plagiarism detection service uses advanced algorithms to compare your text against billions of 
              web pages, academic papers, and publications to identify potential matches and similarities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-md">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <h3 className="font-medium text-center">Upload or paste your text</h3>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-md">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="font-medium text-center">Our algorithm analyzes content</h3>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-md">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-medium text-center">Receive detailed plagiarism report</h3>
              </div>
            </div>
            
            <p>
              When your text is analyzed, our system breaks it down into smaller chunks and compares them 
              against our comprehensive database. Matching passages are highlighted and linked to their original 
              sources, giving you a clear picture of potential plagiarism issues.
            </p>
          </CardContent>
        </Card>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our plagiarism detection tool is trusted by students, educators, and content creators 
              around the world. With our comprehensive database and advanced algorithms, you can be 
              confident that your content is thoroughly checked for originality.
            </p>
            
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Accuracy:</strong> Get precise match detection with source links</li>
              <li><strong>Speed:</strong> Receive results within seconds</li>
              <li><strong>Ease of use:</strong> Simple interface with intuitive controls</li>
              <li><strong>Comprehensive coverage:</strong> Check against billions of sources</li>
              <li><strong>Detailed reports:</strong> Export and save your results</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
