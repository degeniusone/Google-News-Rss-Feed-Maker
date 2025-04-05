"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Copy, Plus, FileText, Github, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DocumentationPage from "./documentation-page"
import LegalPage from "./legal-page"

// Language and region options
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
]

const REGIONS = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "RU", label: "Russia" },
  { value: "ZA", label: "South Africa" },
]

const TIME_FILTERS = [
  { value: "none", label: "No filter" },
  { value: "1h", label: "Past hour" },
  { value: "3h", label: "Past 3 hours" },
  { value: "12h", label: "Past 12 hours" },
  { value: "1d", label: "Past day" },
  { value: "7d", label: "Past week" },
  { value: "30d", label: "Past month" },
  { value: "1y", label: "Past year" },
]

const SEARCH_OPERATORS = [
  { value: "none", label: "Normal search" },
  { value: "allintext:", label: "allintext: (All words in text)" },
  { value: "intitle:", label: "intitle: (Word in title)" },
  { value: "allintitle:", label: "allintitle: (All words in title)" },
  { value: "inurl:", label: "inurl: (Word in URL)" },
  { value: "allinurl:", label: "allinurl: (All words in URL)" },
]

type FeedType = "topic" | "keyword" | "site" | "location"
type PageView = "app" | "docs" | "legal"

interface FeedItem {
  id: string
  type: FeedType
  value: string
  timeFilter?: string
  searchOperator?: string
  exactMatch?: boolean
}

export default function GoogleNewsRSSGenerator() {
  const [feedType, setFeedType] = useState<FeedType>("topic")
  const [language, setLanguage] = useState("en")
  const [region, setRegion] = useState("US")
  const [timeFilter, setTimeFilter] = useState("none")
  const [searchOperator, setSearchOperator] = useState("none")
  const [exactMatch, setExactMatch] = useState(false)
  const [currentValue, setCurrentValue] = useState("")
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [generatedUrl, setGeneratedUrl] = useState("")
  const [currentView, setCurrentView] = useState<PageView>("app")

  const addFeedItem = () => {
    if (!currentValue.trim()) return

    let value = currentValue.trim()

    // For site type, ensure the domain is properly formatted
    if (feedType === "site") {
      // Remove http://, https://, and www. prefixes
      value = value.replace(/^(https?:\/\/)?(www\.)?/, "")
      // Remove any paths or query parameters
      value = value.split("/")[0]
    }

    const newItem: FeedItem = {
      id: crypto.randomUUID(),
      type: feedType,
      value: value,
      timeFilter: feedType === "keyword" || feedType === "site" ? timeFilter : undefined,
      searchOperator: feedType === "keyword" ? searchOperator : undefined,
      exactMatch: feedType === "keyword" ? exactMatch : undefined,
    }

    setFeedItems([...feedItems, newItem])
    setCurrentValue("")
  }

  const removeFeedItem = (id: string) => {
    setFeedItems(feedItems.filter((item) => item.id !== id))
  }

  const generateRssUrl = () => {
    if (feedItems.length === 0) {
      setGeneratedUrl("")
      return
    }

    let url = ""

    // Group items by type
    const topics = feedItems.filter((item) => item.type === "topic")
    const keywords = feedItems.filter((item) => item.type === "keyword")
    const sites = feedItems.filter((item) => item.type === "site")
    const locations = feedItems.filter((item) => item.type === "location")

    // Handle topics (if any)
    if (topics.length > 0) {
      // Google News only supports one topic per feed
      const topic = topics[0]
      url = `https://news.google.com/rss/topics/${topic.value}?hl=${language}&gl=${region}&ceid=${region}:${language}`
    }
    // Handle locations (if any and no topics)
    else if (locations.length > 0) {
      // Google News only supports one location per feed
      const location = locations[0]
      url = `https://news.google.com/rss/headlines/section/geo/${encodeURIComponent(location.value)}?hl=${language}&gl=${region}&ceid=${region}:${language}`
    }
    // Handle keywords and sites
    else if (keywords.length > 0 || sites.length > 0) {
      // Build a search query combining keywords and sites
      let query = ""

      // Add keywords with OR operator
      if (keywords.length > 0) {
        const keywordQueries = keywords.map((k) => {
          let q = ""

          // Apply search operator if specified
          if (k.searchOperator && k.searchOperator !== "none") {
            q += k.searchOperator
          }

          // Apply exact match if specified
          if (k.exactMatch) {
            q += `"${encodeURIComponent(k.value)}"`
          } else {
            q += encodeURIComponent(k.value)
          }

          // Apply time filter if specified
          if (k.timeFilter && k.timeFilter !== "none") {
            q += `+when:${k.timeFilter}`
          }

          return q
        })
        query = keywordQueries.join(" OR ")
      }

      // Add sites with OR operator
      if (sites.length > 0) {
        const siteQueries = sites.map((s) => {
          let q = `site:${encodeURIComponent(s.value)}`
          if (s.timeFilter && s.timeFilter !== "none") {
            q += `+when:${s.timeFilter}`
          }
          return q
        })

        if (query) {
          query += ` OR ${siteQueries.join(" OR ")}`
        } else {
          query = siteQueries.join(" OR ")
        }
      }

      url = `https://news.google.com/rss/search?q=${query}&hl=${language}&gl=${region}&ceid=${region}:${language}`
    }

    setGeneratedUrl(url)
  }

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      // You could add a toast notification here
    }
  }

  const resetFeed = () => {
    setFeedItems([])
    setGeneratedUrl("")
  }

  // Render different views based on currentView state
  if (currentView === "docs") {
    return <DocumentationPage onBack={() => setCurrentView("app")} />
  }

  if (currentView === "legal") {
    return <LegalPage onBack={() => setCurrentView("app")} />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white py-8">
      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto">
        {/* Header with Logo and Icons */}
        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">
              <span className="text-[#F8B700]">Google News RSS</span> <span className="text-[#F87900]">Generator</span>{" "}
              <span className="text-[#F87900]">
                <svg
                  className="w-5 h-5 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9L12 3L6 9V19ZM8 19V9.83L12 5.83L16 9.83V19H8Z"
                    fill="#F87900"
                  />
                  <path d="M9 14H15V16H9V14Z" fill="#F87900" />
                  <path d="M9 11H15V13H9V11Z" fill="#F87900" />
                </svg>
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-transparent"
                    onClick={() => setCurrentView("docs")}
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Documentation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-transparent"
                    onClick={() => window.open("https://github.com/yourusername/google-news-rss-generator", "_blank")}
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GitHub Repository</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-4 px-4">
          {/* Left Column */}
          <div className="w-1/2">
            {/* Feed Settings */}
            <div className="bg-zinc-900 rounded-lg mb-3 p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-[#F87900]">Feed Settings</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-transparent"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select your preferred language and region for the RSS feed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language" className="text-sm mb-1 block text-white">
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-white">
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="region" className="text-sm mb-1 block text-white">
                    Region
                  </Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger id="region" className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {REGIONS.map((reg) => (
                        <SelectItem key={reg.value} value={reg.value} className="text-white">
                          {reg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Add Feed Content */}
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-[#F87900]">Add Feed Content</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-transparent"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select content type and add items to your feed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Feed Type Selection */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  className={`py-2 px-3 rounded text-sm font-medium ${
                    feedType === "topic" ? "bg-[#F8B700] text-black" : "bg-zinc-800 text-white"
                  }`}
                  onClick={() => setFeedType("topic")}
                >
                  Topic ID
                </button>
                <button
                  className={`py-2 px-3 rounded text-sm font-medium ${
                    feedType === "keyword" ? "bg-[#F8B700] text-black" : "bg-zinc-800 text-white"
                  }`}
                  onClick={() => setFeedType("keyword")}
                >
                  Keyword
                </button>
                <button
                  className={`py-2 px-3 rounded text-sm font-medium ${
                    feedType === "site" ? "bg-[#F8B700] text-black" : "bg-zinc-800 text-white"
                  }`}
                  onClick={() => setFeedType("site")}
                >
                  Site
                </button>
                <button
                  className={`py-2 px-3 rounded text-sm font-medium ${
                    feedType === "location" ? "bg-[#F8B700] text-black" : "bg-zinc-800 text-white"
                  }`}
                  onClick={() => setFeedType("location")}
                >
                  Location
                </button>
              </div>

              {/* Advanced Options for Keywords */}
              {feedType === "keyword" && (
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="search-operator" className="text-sm mb-1 block text-white">
                      Search Operator
                    </Label>
                    <Select value={searchOperator} onValueChange={setSearchOperator}>
                      <SelectTrigger
                        id="search-operator"
                        className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white"
                      >
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                        {SEARCH_OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value} className="text-white">
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time-filter" className="text-sm mb-1 block text-white">
                      Time Filter
                    </Label>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger id="time-filter" className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                        {TIME_FILTERS.map((time) => (
                          <SelectItem key={time.value} value={time.value} className="text-white">
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exactMatch}
                        onChange={(e) => setExactMatch(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[#F8B700]"
                      />
                      <span className="text-sm text-white">Exact Match (use quotes)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Time Filter for Sites */}
              {feedType === "site" && (
                <div className="mb-4">
                  <Label htmlFor="time-filter" className="text-sm mb-1 block text-white">
                    Time Filter
                  </Label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger id="time-filter" className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {TIME_FILTERS.map((time) => (
                        <SelectItem key={time.value} value={time.value} className="text-white">
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Input Field and Add Button */}
              <div className="mb-2">
                <Label htmlFor="value" className="text-sm mb-1 block text-white">
                  {feedType === "topic" && "Topic ID"}
                  {feedType === "keyword" && "Keyword or Phrase"}
                  {feedType === "site" && "Domain (e.g., reuters.com)"}
                  {feedType === "location" && "Location (e.g., New York)"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder={
                      feedType === "topic"
                        ? "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB"
                        : feedType === "keyword"
                          ? "Enter keyword or phrase"
                          : feedType === "site"
                            ? "reuters.com"
                            : "New York"
                    }
                    className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white flex-1"
                  />
                  <Button onClick={addFeedItem} className="h-10 bg-[#F8B700] hover:bg-[#F87900] text-black font-medium">
                    <Plus className="mr-1 h-4 w-4" /> Add to Feed
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-1/2">
            <div className="bg-zinc-900 rounded-lg h-full flex flex-col">
              {/* Feed Items */}
              <div className="flex-1 p-4 overflow-auto">
                {feedItems.length > 0 ? (
                  <div className="space-y-2">
                    {feedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-[#F8B700] text-sm mr-1">
                              {item.type === "topic" && "Topic:"}
                              {item.type === "keyword" && "Keyword:"}
                              {item.type === "site" && "Site:"}
                              {item.type === "location" && "Location:"}
                            </span>
                            <span className="font-mono text-sm text-white">
                              {item.exactMatch ? `"${item.value}"` : item.value}
                            </span>
                          </div>
                          {item.searchOperator && item.searchOperator !== "none" && (
                            <div className="text-xs text-zinc-400 mt-1">
                              Operator: {item.searchOperator.replace(":", "")}
                            </div>
                          )}
                          {item.timeFilter && item.timeFilter !== "none" && (
                            <div className="text-xs text-zinc-400 mt-1">
                              Time: {TIME_FILTERS.find((t) => t.value === item.timeFilter)?.label}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeedItem(item.id)}
                          className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <FileText className="h-12 w-12 text-zinc-700 mb-3" />
                    <h3 className="text-xl font-bold text-[#F87900] mb-1">No Feed Items Added</h3>
                    <p className="text-zinc-400 text-sm">
                      Add feed items on the left to begin creating your custom Google News RSS feed.
                    </p>
                  </div>
                )}
              </div>

              {/* Generate Button and Reset Button */}
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <Button
                    onClick={generateRssUrl}
                    disabled={feedItems.length === 0}
                    className="flex-1 h-10 bg-gradient-to-r from-[#F87900] to-[#AE35DD] hover:from-[#F8B700] hover:to-[#F87900] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate RSS Feed URL
                  </Button>
                  <Button
                    onClick={resetFeed}
                    disabled={feedItems.length === 0}
                    className="h-10 bg-zinc-700 hover:bg-zinc-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </Button>
                </div>

                {/* URL Output */}
                {generatedUrl && (
                  <div className="mt-4 flex items-center gap-2 p-2 bg-zinc-800 rounded">
                    <div className="flex-1 font-mono text-xs break-all text-white overflow-x-auto">{generatedUrl}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-transparent flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-500 mt-6">
          Created by Chris Robitaille 2025 - Free to use -{" "}
          <button onClick={() => setCurrentView("docs")} className="hover:text-zinc-400">
            Docs
          </button>{" "}
          -{" "}
          <a
            href="https://github.com/yourusername/google-news-rss-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400"
          >
            Github
          </a>{" "}
          -{" "}
          <button onClick={() => setCurrentView("legal")} className="hover:text-zinc-400">
            Legal
          </button>
        </div>
      </div>
    </div>
  )
}

