'use client'

import { AlertCircle, BookOpen, Code } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'



export default function AdminTripPlanPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trip Planning Guides</h1>
        <p className="text-muted-foreground mt-1">Manage trip planning guides for user preparation</p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <CardTitle className="text-blue-900">Guides Are Now Managed Locally</CardTitle>
              <CardDescription className="text-blue-800 mt-1">
                Trip planning guides have been moved from the database to hardcoded static data for better performance and easier maintenance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p className="mb-3">To update the guides, edit the following file:</p>
          <code className="block bg-blue-100 p-3 rounded font-mono text-xs mb-4 border border-blue-300">
            frontend/lib/plan-your-trip-data.ts
          </code>
          <p className="mb-3">The guides are organized into three categories:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li><strong>Logistics:</strong> Visa, permits, communication services</li>
            <li><strong>Health & Safety:</strong> Medical preparation, altitude sickness, guide etiquette</li>
            <li><strong>Preparation:</strong> Gear, training, weather, seasons</li>
          </ul>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>Guide Management</CardTitle>
          <CardDescription>Current guide features and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">11 Guides</h3>
              </div>
              <p className="text-sm text-muted-foreground">Comprehensive trekking preparation content</p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Accordion UI</h3>
              </div>
              <p className="text-sm text-muted-foreground">Category-based tabs with collapsible content</p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">No Database</h3>
              </div>
              <p className="text-sm text-muted-foreground">Served from frontend static data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Guides Card */}
      <Card>
        <CardHeader>
          <CardTitle>Available Guides</CardTitle>
          <CardDescription>All trip planning guides organized by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-3">Logistics (3)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Visa Information</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Communication Services</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-3">Health & Safety (4)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Health & Medicine</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Hypoxia & Altitude Sickness</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Insurance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Guide Rules & Etiquette</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-3">Preparation (4)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Key Preparations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Gear & Equipment</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Permits & Regulations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Weather & Seasons</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Update Guides</CardTitle>
          <CardDescription>Steps to modify guide content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="space-y-3 list-decimal list-inside">
            <li>
              <span className="font-semibold">Locate the file:</span> Open <code className="bg-muted px-2 py-1 rounded text-xs font-mono">frontend/lib/plan-your-trip-data.ts</code>
            </li>
            <li>
              <span className="font-semibold">Edit the content:</span> Update the guide content in the relevant object within the <code className="bg-muted px-2 py-1 rounded text-xs font-mono">planYourTripGuides</code> array
            </li>
            <li>
              <span className="font-semibold">Save and rebuild:</span> After saving, run <code className="bg-muted px-2 py-1 rounded text-xs font-mono">npm run build</code> or restart the development server
            </li>
            <li>
              <span className="font-semibold">Verify changes:</span> Check the guides display in the "Plan Your Trip" section on the website
            </li>
          </ol>

          <div className="bg-muted p-4 rounded-lg mt-4 border border-border">
            <p className="font-semibold text-sm mb-2">Example: Editing a Guide</p>
            <code className="block text-xs whitespace-pre-wrap break-words overflow-auto">
{`{
  id: '69ccf499658024d8ddb7a1b1',
  slug: 'key-preparations',
  title: 'Key Preparations',
  description: 'Essential steps...',
  category: 'Preparation',
  icon: 'CheckCircle',
  order: 1,
  content: \`# Key Preparations for Your Trek\n...\`
}`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Display Locations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Where Guides Are Displayed</CardTitle>
          <CardDescription>Public locations where guides appear to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 border border-border rounded">
            <span className="text-primary font-semibold">1.</span>
            <div>
              <p className="font-semibold">Navigation Mega Menu</p>
              <p className="text-muted-foreground">Guides appear in "Plan Your Trip" dropdown with 3 category columns</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-border rounded">
            <span className="text-primary font-semibold">2.</span>
            <div>
              <p className="font-semibold">Guides Page</p>
              <p className="text-muted-foreground">Full list with accordion interface at <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">/guides</code></p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-border rounded">
            <span className="text-primary font-semibold">3.</span>
            <div>
              <p className="font-semibold">Individual Guide Pages</p>
              <p className="text-muted-foreground">Full guide content at <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">/guides/[slug]</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
