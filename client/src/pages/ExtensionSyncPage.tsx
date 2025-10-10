import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, Download, ExternalLink } from 'lucide-react';
import type { User } from '@shared/schema';

export default function ExtensionSyncPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [synced, setSynced] = useState(false);

  const { data: userProfile } = useQuery<User>({
    queryKey: ['/api/profile', user?.id],
    enabled: !!user?.id,
  });

  // Check if extension is installed
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    // Check for extension
    const checkExtension = () => {
      if (window.chrome && chrome.runtime) {
        // Extension might be installed
        setExtensionInstalled(true);
      }
    };
    checkExtension();
  }, []);

  // Prepare data for extension
  const extensionData = userProfile ? {
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    location: userProfile.location || '',
    skills: userProfile.skills || [],
    linkedin: '', // Add if you have this field
    portfolio: '', // Add if you have this field
    coverLetter: '', // Will be generated per application
    resumeUrl: userProfile.resumeUrl || '',
  } : null;

  // Copy data to clipboard
  const copyToClipboard = () => {
    if (extensionData) {
      navigator.clipboard.writeText(JSON.stringify(extensionData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Send data to extension
  const syncWithExtension = async () => {
    if (!extensionData) return;

    try {
      // Try to communicate with extension
      if (window.chrome && chrome.runtime) {
        // Send message to extension
        const message = {
          type: 'SYNC_COMPLETE',
          userData: extensionData,
        };

        // Post message to extension
        window.postMessage({ source: 'swipejob-app', ...message }, '*');

        // Also try direct storage access (if on same origin)
        try {
          await chrome.storage.local.set({ swipeJobUserData: extensionData });
        } catch (e) {
          console.log('Direct storage access not available');
        }

        setSynced(true);
        
        // Show success notification
        setTimeout(() => {
          alert('Profile synced with extension! You can now close this tab.');
        }, 500);
      } else {
        alert('Extension not detected. Please install the SwipeJob extension first.');
      }
    } catch (error) {
      console.error('Error syncing with extension:', error);
      alert('Sync failed. Please try the manual copy method below.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to sync your profile with the browser extension.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sync with Browser Extension
          </h1>
          <p className="text-lg text-gray-600">
            Connect your SwipeJob profile to the Auto-Fill extension
          </p>
        </div>

        {/* Extension Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              extensionInstalled ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {extensionInstalled ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <Download className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {extensionInstalled ? 'Extension Detected' : 'Extension Not Detected'}
              </h3>
              <p className="text-sm text-gray-600">
                {extensionInstalled 
                  ? 'SwipeJob Auto-Fill extension is installed'
                  : 'Please install the extension first'
                }
              </p>
            </div>
            {!extensionInstalled && (
              <Button variant="outline" asChild>
                <a href="/extension-help" target="_blank">
                  Install Guide
                </a>
              </Button>
            )}
          </div>
        </Card>

        {/* Profile Data */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Your Profile Data</h3>
          
          {extensionData ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="font-medium">{extensionData.name || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="font-medium">{extensionData.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <p className="font-medium">{extensionData.phone || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <p className="font-medium">{extensionData.location || 'Not set'}</p>
                </div>
              </div>
              
              {extensionData.skills && extensionData.skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-sm font-medium text-gray-500">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {extensionData.skills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                    {extensionData.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">
                        +{extensionData.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Complete your profile to enable auto-fill.
                <a href="/profile" className="ml-2 text-yellow-900 underline font-medium">
                  Go to Profile →
                </a>
              </p>
            </div>
          )}
        </Card>

        {/* Sync Methods */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Sync Methods</h3>
          
          <div className="space-y-4">
            {/* Method 1: Automatic */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Automatic Sync (Recommended)</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Instantly sync your profile with one click.
                  </p>
                  <Button 
                    onClick={syncWithExtension}
                    disabled={!extensionData || !extensionInstalled}
                    className={synced ? 'bg-green-600' : ''}
                  >
                    {synced ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Synced Successfully!
                      </>
                    ) : (
                      'Sync Now'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Method 2: Manual Copy */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Manual Copy (Backup Method)</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    If automatic sync doesn't work, copy your data manually.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={copyToClipboard}
                      disabled={!extensionData}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Data
                        </>
                      )}
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="#instructions">
                        View Instructions
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6" id="instructions">
          <h3 className="font-semibold text-lg mb-4">How to Use</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <span className="font-bold text-green-600">Step 1:</span>
              <p>Install the SwipeJob Auto-Fill browser extension (see install guide)</p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-green-600">Step 2:</span>
              <p>Click "Sync Now" above to sync your profile</p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-green-600">Step 3:</span>
              <p>Visit any job application page (Pnet, Careers24, Indeed, etc.)</p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-green-600">Step 4:</span>
              <p>Forms auto-fill automatically! Review and submit.</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Need Help?
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Check out the installation guide for detailed instructions.
            </p>
            <Button variant="link" asChild className="p-0 h-auto">
              <a href="/extension-help" target="_blank" className="text-blue-600">
                View Installation Guide →
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
