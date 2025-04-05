"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Copy, Plus, FileText, Github, HelpCircle, List, Code, Loader2 } from "lucide-react"
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

const MAIN_TOPICS = [
  { value: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB", label: "World" },
  { value: "CAAqIggKIhxDQkFTRHdvSkwyMHZNRGxqTjNjd0VnSmxiaWdBUAE", label: "US" },
  { value: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB", label: "Business" },
  { value: "CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB", label: "Technology" },
  { value: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB", label: "Entertainment" },
  { value: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB", label: "Sports" },
  { value: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB", label: "Science" },
  { value: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ", label: "Health" },
]

type FeedType = "topic" | "keyword" | "site" | "location" | "main-topic"
type PageView = "app" | "docs" | "legal"

interface FeedItem {
  id: string
  type: FeedType
  value: string
  timeFilter?: string
  searchOperator?: string
  exactMatch?: boolean
  label?: string
}

interface SavedTopic {
  id: string
  value: string
  name: string
}

export default function GoogleNewsRSSMaker() {
  const [feedType, setFeedType] = useState<FeedType>("topic")
  const [language, setLanguage] = useState("en")
  const [region, setRegion] = useState("US")
  const [timeFilter, setTimeFilter] = useState("none")
  const [searchOperator, setSearchOperator] = useState("none")
  const [exactMatch, setExactMatch] = useState(false)
  const [currentValue, setCurrentValue] = useState("")
  const [topicName, setTopicName] = useState("")
  const [selectedMainTopic, setSelectedMainTopic] = useState("")
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([])
  const [showSavedTopics, setShowSavedTopics] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState("")
  const [xmlPreview, setXmlPreview] = useState("")
  const [isLoadingXml, setIsLoadingXml] = useState(false)
  const [xmlError, setXmlError] = useState("")
  const [currentView, setCurrentView] = useState<PageView>("app")

  // Load saved topics from localStorage on component mount
  useEffect(() => {
    const storedTopics = localStorage.getItem("savedTopics")
    if (storedTopics) {
      setSavedTopics(JSON.parse(storedTopics))
    }
  }, [])

  // Save topics to localStorage when they change
  useEffect(() => {
    localStorage.setItem("savedTopics", JSON.stringify(savedTopics))
  }, [savedTopics])

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
      label: feedType === "topic" ? topicName.trim() || undefined : undefined,
    }

    setFeedItems([...feedItems, newItem])

    // If it's a topic with a name, save it to the saved topics list
    if (feedType === "topic" && value && topicName.trim()) {
      const newSavedTopic: SavedTopic = {
        id: crypto.randomUUID(),
        value: value,
        name: topicName.trim(),
      }
      setSavedTopics([...savedTopics, newSavedTopic])
    }

    setCurrentValue("")
    setTopicName("")
  }

  const addMainTopicToFeed = () => {
    if (!selectedMainTopic) return

    const topic = MAIN_TOPICS.find((t) => t.value === selectedMainTopic)
    if (!topic) return

    const newItem: FeedItem = {
      id: crypto.randomUUID(),
      type: "main-topic",
      value: selectedMainTopic,
      label: topic.label,
    }

    setFeedItems([...feedItems, newItem])
    setSelectedMainTopic("")
  }

  const addSavedTopicToFeed = (topic: SavedTopic) => {
    const newItem: FeedItem = {
      id: crypto.randomUUID(),
      type: "topic",
      value: topic.value,
      label: topic.name,
    }

    setFeedItems([...feedItems, newItem])
  }

  const removeFeedItem = (id: string) => {
    setFeedItems(feedItems.filter((item) => item.id !== id))
  }

  const removeSavedTopic = (id: string) => {
    setSavedTopics(savedTopics.filter((topic) => topic.id !== id))
  }

  const copyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text)
      // You could add a toast notification here
    }
  }

  const fetchXmlPreview = async (url: string) => {
    if (!url) {
      setXmlPreview("")
      setXmlError("")
      return
    }

    setIsLoadingXml(true)
    setXmlError("")

    try {
      // Use a CORS proxy to fetch the RSS feed
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)

      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
      }

      const xmlText = await response.text()
      setXmlPreview(xmlText)
    } catch (error) {
      console.error("Error fetching RSS feed:", error)
      setXmlError(`Error fetching RSS feed: ${error instanceof Error ? error.message : String(error)}`)

      // Fallback to a basic XML template if we can't fetch the real feed
      const feedTitle =
        feedItems.length > 0
          ? feedItems[0].label ||
            `${feedItems[0].type.charAt(0).toUpperCase() + feedItems[0].type.slice(1)}: ${feedItems[0].value}`
          : "Google News RSS Feed"

      const currentDate = new Date().toUTCString()

      // Create a basic XML template
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${feedTitle}</title>
    <description>Google News RSS feed for ${feedTitle}</description>
    <link>${url}</link>
    <language>${language}</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${url}" rel="self" type="application/rss+xml" />
    <!-- Unable to fetch actual content. This is a preview template. -->
    <item>
      <title>Unable to fetch actual RSS content</title>
      <description>The actual RSS feed could not be fetched due to CORS restrictions or network issues. Please copy the URL and use it directly in your RSS reader.</description>
      <pubDate>${currentDate}</pubDate>
    </item>
  </channel>
</rss>`

      setXmlPreview(fallbackXml)
    } finally {
      setIsLoadingXml(false)
    }
  }

  const generateRssUrl = () => {
    if (feedItems.length === 0) {
      setGeneratedUrl("")
      setXmlPreview("")
      setXmlError("")
      return
    }

    let url = ""

    // Group items by type
    const mainTopics = feedItems.filter((item) => item.type === "main-topic")
    const topics = feedItems.filter((item) => item.type === "topic")
    const keywords = feedItems.filter((item) => item.type === "keyword")
    const sites = feedItems.filter((item) => item.type === "site")
    const locations = feedItems.filter((item) => item.type === "location")

    // Build the search query combining all items
    let query = ""
    let hasTopicOrLocation = false

    // Handle main topics (only one allowed)
    if (mainTopics.length > 0) {
      // Google News only supports one main topic per feed
      const topic = mainTopics[0]
      url = `https://news.google.com/rss/topics/${topic.value}?hl=${language}&gl=${region}&ceid=${region}:${language}`
      hasTopicOrLocation = true
    }
    // Handle locations (if any and no main topics)
    else if (locations.length > 0) {
      // Google News only supports one location per feed
      const location = locations[0]
      url = `https://news.google.com/rss/headlines/section/geo/${encodeURIComponent(location.value)}?hl=${language}&gl=${region}&ceid=${region}:${language}`
      hasTopicOrLocation = true
    }

    // If we have regular topics, keywords or sites, we need to build a search query
    if ((topics.length > 0 || keywords.length > 0 || sites.length > 0) && !hasTopicOrLocation) {
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
            q += `"${k.value}"`
          } else {
            q += k.value
          }

          // Apply time filter if specified
          if (k.timeFilter && k.timeFilter !== "none") {
            q += ` when:${k.timeFilter}`
          }

          return q
        })
        query = keywordQueries.join(" OR ")
      }

      // Add sites with OR operator
      if (sites.length > 0) {
        const siteQueries = sites.map((s) => {
          let q = `site:${s.value}`
          if (s.timeFilter && s.timeFilter !== "none") {
            q += ` when:${s.timeFilter}`
          }
          return q
        })

        if (query) {
          query += ` OR ${siteQueries.join(" OR ")}`
        } else {
          query = siteQueries.join(" OR ")
        }
      }

      // Add regular topics with OR operator
      if (topics.length > 0) {
        const topicQueries = topics.map((t) => {
          let q = `topic:${t.value}`
          return q
        })

        if (query) {
          query += ` OR ${topicQueries.join(" OR ")}`
        } else {
          query = topicQueries.join(" OR ")
        }
      }

      url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${language}&gl=${region}&ceid=${region}:${language}`
    }

    setGeneratedUrl(url)
    fetchXmlPreview(url)
  }

  const resetFeed = () => {
    setFeedItems([])
    setGeneratedUrl("")
    setXmlPreview("")
    setXmlError("")
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
              <span className="text-[#F8B700]">Google News RSS</span> <span className="text-[#F8B700]">Maker</span>{" "}
              <span className="text-[#F8B700]">
                <svg
                  className="w-5 h-5 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9L12 3L6 9V19ZM8 19V9.83L12 5.83L16 9.83V19H8Z"
                    fill="#F8B700"
                  />
                  <path d="M9 14H15V16H9V14Z" fill="#F8B700" />
                  <path d="M9 11H15V13H9V11Z" fill="#F8B700" />
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
                    onClick={() => window.open("https://github.com/yourusername/google-news-rss-maker", "_blank")}
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
                <h2 className="text-lg font-medium text-[#F8B700]">Feed Settings</h2>
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
                        <SelectItem
                          key={lang.value}
                          value={lang.value}
                          className="text-white hover:bg-[#F8B700] hover:text-black data-[highlighted]:bg-[#F8B700] data-[highlighted]:text-black"
                        >
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
                        <SelectItem
                          key={reg.value}
                          value={reg.value}
                          className="text-white hover:bg-[#F8B700] hover:text-black data-[highlighted]:bg-[#F8B700] data-[highlighted]:text-black"
                        >
                          {reg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Main Topic Block */}
            <div className="bg-zinc-900 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-[#F8B700]">Main Topic</h2>
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
                      <p>Select a predefined Google News topic</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex gap-2">
                <Select value={selectedMainTopic} onValueChange={setSelectedMainTopic}>
                  <SelectTrigger className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white flex-1">
                    <SelectValue placeholder="Select a main topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {MAIN_TOPICS.map((topic) => (
                      <SelectItem
                        key={topic.value}
                        value={topic.value}
                        className="text-white hover:bg-[#F8B700] hover:text-black data-[highlighted]:bg-[#F8B700] data-[highlighted]:text-black"
                      >
                        {topic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={addMainTopicToFeed}
                  className="h-10 bg-[#F8B700] hover:bg-[#F8B700] text-black font-medium"
                  disabled={!selectedMainTopic}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add to Feed
                </Button>
              </div>
            </div>

            {/* Secret Topics Block */}
            <div className="bg-zinc-900 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-[#F8B700]">Secret Topics</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSavedTopics(!showSavedTopics)}
                    className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-transparent"
                  >
                    <List className="h-4 w-4" />
                  </Button>
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
                        <p>Add a Google News Topic ID to your feed</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="topic-value" className="text-sm mb-1 block text-white">
                    Topic ID
                  </Label>
                  <Input
                    id="topic-value"
                    value={feedType === "topic" ? currentValue : ""}
                    onChange={(e) => {
                      setFeedType("topic")
                      setCurrentValue(e.target.value)
                    }}
                    placeholder="CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB"
                    className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="topic-name" className="text-sm mb-1 block text-white">
                    Topic Name (optional)
                  </Label>
                  <Input
                    id="topic-name"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="My Custom Topic"
                    className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  onClick={() => {
                    if (feedType === "topic" && currentValue.trim()) {
                      addFeedItem()
                    }
                  }}
                  className="h-10 bg-[#F8B700] hover:bg-[#F8B700] text-black font-medium"
                  disabled={feedType !== "topic" || !currentValue.trim()}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add to Feed
                </Button>
                <a
                  href="https://newscatcherapi.com/blog/google-news-rss-feed-complete-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#F8B700] hover:underline"
                >
                  How to find Topic IDs
                </a>
              </div>

              {/* Saved Topics List */}
              {showSavedTopics && savedTopics.length > 0 && (
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <h3 className="text-sm font-medium text-white mb-2">Saved Topics</h3>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {savedTopics.map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium text-[#F8B700] text-sm mr-1">{topic.name}:</span>
                              <span className="font-mono text-xs text-white truncate max-w-[150px]">{topic.value}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addSavedTopicToFeed(topic)}
                              className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-transparent"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSavedTopic(topic.id)}
                              className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Keywords Block */}
            <div className="bg-zinc-900 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-[#F8B700]">Keywords</h2>
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
                      <p>Add keywords or phrases to your feed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search-operator" className="text-sm mb-1 block text-white">
                    Search Operator
                  </Label>
                  <Select
                    value={feedType === "keyword" ? searchOperator : "none"}
                    onValueChange={(value) => {
                      setFeedType("keyword")
                      setSearchOperator(value)
                    }}
                  >
                    <SelectTrigger id="search-operator" className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {SEARCH_OPERATORS.map((op) => (
                        <SelectItem
                          key={op.value}
                          value={op.value}
                          className="text-white hover:bg-[#F8B700] hover:text-black data-[highlighted]:bg-[#F8B700] data-[highlighted]:text-black"
                        >
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time-filter-keyword" className="text-sm mb-1 block text-white">
                    Time Filter
                  </Label>
                  <Select
                    value={feedType === "keyword" ? timeFilter : "none"}
                    onValueChange={(value) => {
                      setFeedType("keyword")
                      setTimeFilter(value)
                    }}
                  >
                    <SelectTrigger
                      id="time-filter-keyword"
                      className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white"
                    >
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {TIME_FILTERS.map((time) => (
                        <SelectItem
                          key={time.value}
                          value={time.value}
                          className="text-white hover:bg-[#F8B700] hover:text-black data-[highlighted]:bg-[#F8B700] data-[highlighted]:text-black"
                        >
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
                      checked={feedType === "keyword" && exactMatch}
                      onChange={(e) => {
                        setFeedType("keyword")
                        setExactMatch(e.target.checked)
                      }}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[#F8B700]"
                    />
                    <span className="text-sm text-white">Exact Match (use quotes)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  id="keyword-value"
                  value={feedType === "keyword" ? currentValue : ""}
                  onChange={(e) => {
                    setFeedType("keyword")
                    setCurrentValue(e.target.value)
                  }}
                  placeholder="Enter keyword or phrase"
                  className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white flex-1"
                />
                <Button
                  onClick={() => {
                    if (feedType === "keyword" && currentValue.trim()) {
                      addFeedItem()
                    }
                  }}
                  className="h-10 bg-[#F8B700] hover:bg-[#F8B700] text-black font-medium"
                  disabled={feedType !== "keyword" || !currentValue.trim()}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add to Feed
                </Button>
              </div>
            </div>

            {/* Site Block */}
            <div className="bg-zinc-900 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-[#F8B700]">Site</h2>
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
                      <p>Add specific websites to your feed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="mb-4">
                <Label htmlFor="time-filter-site" className="text-sm mb-1 block text-white">
                  Time Filter
                </Label>
                <Select
                  value={feedType === "site" ? timeFilter : "none"}
                  onValueChange={(value) => {
                    setFeedType("site")
                    setTimeFilter(value)
                  }}
                >
                  <SelectTrigger id="time-filter-site" className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {TIME_FILTERS.map((time) => (
                      <SelectItem
                        key={time.value}
                        value={time.value}
                        className="text-white hover:bg-[#F8B700] hover:text-black data-[highlighted]:bg-[#F8B700] data-[highlighted]:text-black"
                      >
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Input
                  id="site-value"
                  value={feedType === "site" ? currentValue : ""}
                  onChange={(e) => {
                    setFeedType("site")
                    setCurrentValue(e.target.value)
                  }}
                  placeholder="reuters.com"
                  className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white flex-1"
                />
                <Button
                  onClick={() => {
                    if (feedType === "site" && currentValue.trim()) {
                      addFeedItem()
                    }
                  }}
                  className="h-10 bg-[#F8B700] hover:bg-[#F8B700] text-black font-medium"
                  disabled={feedType !== "site" || !currentValue.trim()}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add to Feed
                </Button>
              </div>
            </div>

            {/* Location Block */}
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-[#F8B700]">Location</h2>
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
                      <p>Add a location to your feed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex gap-2">
                <Input
                  id="location-value"
                  value={feedType === "location" ? currentValue : ""}
                  onChange={(e) => {
                    setFeedType("location")
                    setCurrentValue(e.target.value)
                  }}
                  placeholder="New York"
                  className="h-10 text-sm bg-zinc-800 border-zinc-700 text-white flex-1"
                />
                <Button
                  onClick={() => {
                    if (feedType === "location" && currentValue.trim()) {
                      addFeedItem()
                    }
                  }}
                  className="h-10 bg-[#F8B700] hover:bg-[#F8B700] text-black font-medium"
                  disabled={feedType !== "location" || !currentValue.trim()}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add to Feed
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-1/2 flex flex-col">
            {/* Feed Items Block */}
            <div className="bg-zinc-900 rounded-lg flex-1 flex flex-col mb-3">
              {/* Feed Items */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-medium text-[#F8B700]">Feed Items</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFeed}
                    disabled={feedItems.length === 0}
                    className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Reset All
                  </Button>
                </div>

                {feedItems.length > 0 ? (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {feedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-[#F8B700] text-sm mr-1">
                              {item.type === "topic" && "Secret Topic:"}
                              {item.type === "main-topic" && "Main Topic:"}
                              {item.type === "keyword" && "Keyword:"}
                              {item.type === "site" && "Site:"}
                              {item.type === "location" && "Location:"}
                            </span>
                            <span className="font-mono text-sm text-white">
                              {item.label ? item.label : item.exactMatch ? `"${item.value}"` : item.value}
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
                    <h3 className="text-xl font-bold text-[#F8B700] mb-1">No Feed Items Added</h3>
                    <p className="text-zinc-400 text-sm">
                      Add feed items on the left to begin creating your custom Google News RSS feed.
                    </p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <Button
                    onClick={generateRssUrl}
                    disabled={feedItems.length === 0 || isLoadingXml}
                    className="flex-1 h-10 bg-gradient-to-r from-[#F8B700] to-[#F8B700] hover:from-[#F8B700] hover:to-[#F8B700] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingXml ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      "Generate RSS Feed URL"
                    )}
                  </Button>
                </div>

                {/* URL Output */}
                {generatedUrl && (
                  <div className="mt-4 flex items-center gap-2 p-2 bg-zinc-800 rounded">
                    <div className="flex-1 font-mono text-xs break-all text-white overflow-x-auto">{generatedUrl}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedUrl)}
                      className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-transparent flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* XML Preview Block */}
            <div className="bg-zinc-900 rounded-lg flex-1 flex flex-col">
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-medium text-[#F8B700]">XML Preview</h2>
                  {xmlPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(xmlPreview)}
                      className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy XML
                    </Button>
                  )}
                </div>
                <div className="bg-zinc-800 rounded p-3 overflow-auto flex-1">
                  {isLoadingXml ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Loader2 className="h-12 w-12 text-[#F8B700] animate-spin mb-3" />
                      <h3 className="text-xl font-bold text-[#F8B700] mb-1">Loading XML Preview</h3>
                      <p className="text-zinc-400 text-sm">Fetching the RSS feed content...</p>
                    </div>
                  ) : xmlPreview ? (
                    <pre className="text-xs font-mono text-white whitespace-pre-wrap">{xmlPreview}</pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Code className="h-12 w-12 text-zinc-700 mb-3" />
                      <h3 className="text-xl font-bold text-[#F8B700] mb-1">No XML Preview</h3>
                      <p className="text-zinc-400 text-sm">Generate an RSS feed URL to see the XML preview here.</p>
                    </div>
                  )}

                  {xmlError && (
                    <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
                      <p className="font-bold mb-1">Error fetching RSS feed:</p>
                      <p>{xmlError}</p>
                    </div>
                  )}
                </div>
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
            href="https://github.com/yourusername/google-news-rss-maker"
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
