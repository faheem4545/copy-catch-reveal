
import { toast } from "sonner";

type SupportedIntegration = 'google-docs' | 'word-online' | 'moodle' | 'canvas' | 'brightspace';

interface IntegrationConfig {
  name: string;
  icon: string;
  baseUrl: string;
  isAvailable: boolean;
  authRequirement: 'oauth' | 'api-key' | 'none';
}

const integrationConfigs: Record<SupportedIntegration, IntegrationConfig> = {
  'google-docs': {
    name: 'Google Docs',
    icon: 'google',
    baseUrl: 'https://docs.google.com',
    isAvailable: true,
    authRequirement: 'oauth'
  },
  'word-online': {
    name: 'Microsoft Word',
    icon: 'microsoft',
    baseUrl: 'https://office.com',
    isAvailable: true,
    authRequirement: 'oauth'
  },
  'moodle': {
    name: 'Moodle',
    icon: 'moodle',
    baseUrl: '',
    isAvailable: false,
    authRequirement: 'api-key'
  },
  'canvas': {
    name: 'Canvas LMS',
    icon: 'canvas',
    baseUrl: '',
    isAvailable: false,
    authRequirement: 'api-key'
  },
  'brightspace': {
    name: 'D2L Brightspace',
    icon: 'brightspace',
    baseUrl: '',
    isAvailable: false,
    authRequirement: 'api-key'
  }
};

export function getAvailableIntegrations(): Array<{ id: SupportedIntegration } & IntegrationConfig> {
  return Object.entries(integrationConfigs)
    .filter(([_, config]) => config.isAvailable)
    .map(([id, config]) => ({
      id: id as SupportedIntegration,
      ...config
    }));
}

export async function getContentFromIntegration(
  integration: SupportedIntegration, 
  documentId: string
): Promise<string | null> {
  // This is a placeholder that would actually connect to the service APIs
  // In a real implementation, this would use OAuth tokens or API keys to fetch content
  
  toast.info(`Connecting to ${integrationConfigs[integration].name}...`);
  
  // For now, we'll simulate the integration
  try {
    // In a real implementation, this would make API calls to the respective platforms
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Connected to ${integrationConfigs[integration].name}`);
    
    // Return simulated content
    return `This is sample content retrieved from ${integrationConfigs[integration].name} document ID: ${documentId}.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.`;
  } catch (error) {
    console.error(`Error fetching content from ${integration}:`, error);
    toast.error(`Failed to connect to ${integrationConfigs[integration].name}`);
    return null;
  }
}

export async function sendResultToIntegration(
  integration: SupportedIntegration,
  documentId: string,
  result: {
    similarityScore: number;
    highlightedSections: Array<{text: string, matchPercentage: number}>;
    sources: Array<{title: string, url: string}>
  }
): Promise<boolean> {
  // This is a placeholder that would actually connect to the service APIs
  try {
    toast.info(`Sending results to ${integrationConfigs[integration].name}...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Results sent to ${integrationConfigs[integration].name}`);
    return true;
  } catch (error) {
    console.error(`Error sending results to ${integration}:`, error);
    toast.error(`Failed to send results to ${integrationConfigs[integration].name}`);
    return false;
  }
}

// This would be used for a browser extension integration
export function injectPlagiarismChecker(): void {
  // This function would be used in a browser extension context to inject
  // the plagiarism checking functionality into supported websites
  console.log('Plagiarism checker injected into page');
  
  // In a real browser extension, this would:
  // 1. Detect the current website (Google Docs, Word Online, etc.)
  // 2. Inject appropriate listeners and UI elements
  // 3. Set up communication between the page and the extension
}
