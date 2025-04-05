"use client"

import { ArrowLeft, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentationPageProps {
  onBack: () => void
}

export default function DocumentationPage({ onBack }: DocumentationPageProps) {
  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-4 h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">
            <span className="text-[#F8B700]">Google News RSS</span> <span className="text-[#F8B700]">Maker</span>
            <span className="text-xl ml-2 text-zinc-400">Documentation</span>
          </h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#F8B700] mb-4">Introduction</h2>
            <p className="text-zinc-300 mb-4">
              Google News RSS Maker allows you to create custom RSS feeds from Google News by combining topics,
              keywords, sites, and locations. This tool helps you get the most out of Google News' RSS capabilities,
              which are more powerful than most people realize.
            </p>
            <p className="text-zinc-300">
              You can use these RSS feeds in any feed reader or for data collection purposes. The tool generates the
              correct URL syntax based on your selections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F8B700] mb-4">Feed Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-[#F8B700] mb-2">Topic ID</h3>
                <p className="text-zinc-300 mb-2">
                  Google News organizes content by topics, each with a unique ID. You can find these IDs in the Google
                  News URL when browsing topics.
                </p>
                <p className="text-zinc-400 text-sm">
                  Example:{" "}
                  <code className="bg-zinc-800 px-1 rounded">
                    CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB
                  </code>
                </p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-[#F8B700] mb-2">Keyword</h3>
                <p className="text-zinc-300 mb-2">
                  Search for news articles containing specific keywords or phrases. You can use advanced search
                  operators for more precise results.
                </p>
                <p className="text-zinc-400 text-sm">
                  Example: <code className="bg-zinc-800 px-1 rounded">artificial intelligence</code> or{" "}
                  <code className="bg-zinc-800 px-1 rounded">allintitle:climate change</code>
                </p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-[#F8B700] mb-2">Site</h3>
                <p className="text-zinc-300 mb-2">
                  Get news from specific websites indexed by Google News. Just enter the domain name without http:// or
                  www.
                </p>
                <p className="text-zinc-400 text-sm">
                  Example: <code className="bg-zinc-800 px-1 rounded">reuters.com</code> or{" "}
                  <code className="bg-zinc-800 px-1 rounded">nytimes.com</code>
                </p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-[#F8B700] mb-2">Location</h3>
                <p className="text-zinc-300 mb-2">
                  Find news about specific geographic locations. You can enter cities, states, countries, or regions.
                </p>
                <p className="text-zinc-400 text-sm">
                  Example: <code className="bg-zinc-800 px-1 rounded">New York</code> or{" "}
                  <code className="bg-zinc-800 px-1 rounded">California</code>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F8B700] mb-4">Advanced Search Options</h2>
            <div className="bg-zinc-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-[#F8B700] mb-4">Search Operators</h3>
              <ul className="space-y-3">
                <li>
                  <span className="font-bold text-white">allintext:</span>
                  <p className="text-zinc-300">Finds pages where all the specified terms appear in the body text.</p>
                </li>
                <li>
                  <span className="font-bold text-white">intitle:</span>
                  <p className="text-zinc-300">Finds pages where the specified term appears in the title.</p>
                </li>
                <li>
                  <span className="font-bold text-white">allintitle:</span>
                  <p className="text-zinc-300">Finds pages where all the specified terms appear in the title.</p>
                </li>
                <li>
                  <span className="font-bold text-white">inurl:</span>
                  <p className="text-zinc-300">Finds pages where the specified term appears in the URL.</p>
                </li>
                <li>
                  <span className="font-bold text-white">allinurl:</span>
                  <p className="text-zinc-300">Finds pages where all the specified terms appear in the URL.</p>
                </li>
                <li>
                  <span className="font-bold text-white">Exact Match (quotes):</span>
                  <p className="text-zinc-300">Use quotes to search for an exact phrase, e.g., "climate change".</p>
                </li>
              </ul>

              <h3 className="text-xl font-bold text-[#F8B700] mt-6 mb-4">Time Filters</h3>
              <p className="text-zinc-300 mb-3">Limit results to articles published within a specific time frame:</p>
              <ul className="grid grid-cols-2 gap-2 text-zinc-300">
                <li>Past hour</li>
                <li>Past 3 hours</li>
                <li>Past 12 hours</li>
                <li>Past day</li>
                <li>Past week</li>
                <li>Past month</li>
                <li>Past year</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F8B700] mb-4">How to Use</h2>
            <ol className="space-y-4 text-zinc-300">
              <li>
                <span className="font-bold text-white">1. Select Language and Region</span>
                <p>Choose your preferred language and region for the RSS feed.</p>
              </li>
              <li>
                <span className="font-bold text-white">2. Choose Feed Type</span>
                <p>Select from Main Topic, Secret Topic, Keyword, Site, or Location.</p>
              </li>
              <li>
                <span className="font-bold text-white">3. Configure Advanced Options</span>
                <p>For keywords and sites, you can set search operators and time filters.</p>
              </li>
              <li>
                <span className="font-bold text-white">4. Add Items to Your Feed</span>
                <p>Enter values and click "Add to Feed" to build your feed configuration.</p>
              </li>
              <li>
                <span className="font-bold text-white">5. Generate RSS URL</span>
                <p>Click "Generate RSS Feed URL" to create your custom feed URL.</p>
              </li>
              <li>
                <span className="font-bold text-white">6. Copy and Use</span>
                <p>Copy the generated URL to use in your RSS reader or application.</p>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F8B700] mb-4">Limitations</h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>Google News RSS feeds are limited to 100 articles per feed.</li>
              <li>Only one topic or location can be used per feed.</li>
              <li>Keywords and sites can be combined with OR operators.</li>
              <li>Not all countries and languages are supported by Google News.</li>
              <li>Google does not provide official documentation for these RSS feeds.</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-zinc-800 flex justify-between items-center">
            <a
              href="https://github.com/yourusername/google-news-rss-maker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#F8B700] hover:text-[#F8B700] transition-colors"
            >
              <Github className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
            <p className="text-zinc-500">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

