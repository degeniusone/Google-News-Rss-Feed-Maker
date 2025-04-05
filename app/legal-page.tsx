"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LegalPageProps {
  onBack: () => void
}

export default function LegalPage({ onBack }: LegalPageProps) {
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
            <span className="text-[#F8B700]">Google News RSS</span> <span className="text-[#F87900]">Generator</span>
            <span className="text-xl ml-2 text-zinc-400">Legal Information</span>
          </h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#F87900] mb-4">Terms of Use</h2>
            <p className="text-zinc-300 mb-4">
              By using the Google News RSS Generator, you agree to these terms and conditions. If you do not agree to
              these terms, please do not use this tool.
            </p>
            <p className="text-zinc-300">
              This tool is provided "as is" without warranty of any kind, either expressed or implied, including, but
              not limited to, the implied warranties of merchantability and fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F87900] mb-4">Disclaimer</h2>
            <p className="text-zinc-300 mb-4">
              Google News RSS Generator is not affiliated with, endorsed by, or sponsored by Google. All Google
              trademarks and logos are property of Google Inc.
            </p>
            <p className="text-zinc-300 mb-4">
              This tool simply helps users generate valid RSS feed URLs for Google News based on Google's existing RSS
              feed structure. We do not host, store, or provide any news content ourselves.
            </p>
            <p className="text-zinc-300">
              The developers of this tool are not responsible for any changes Google may make to their RSS feed
              structure that could affect the functionality of this generator.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F87900] mb-4">Privacy Policy</h2>
            <p className="text-zinc-300 mb-4">
              The Google News RSS Generator does not collect, store, or process any personal data. All feed generation
              happens in your browser, and no data is sent to our servers.
            </p>
            <p className="text-zinc-300">
              We do not use cookies or any tracking technologies. Your feed configurations are stored only in your
              browser's local storage and are not accessible to us or any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F87900] mb-4">License</h2>
            <p className="text-zinc-300 mb-4">
              The Google News RSS Generator is open-source software licensed under the MIT License.
            </p>
            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-zinc-300 font-mono text-sm">
                MIT License
                <br />
                <br />
                Copyright (c) 2025 Chris Robitaille
                <br />
                <br />
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
                associated documentation files (the "Software"), to deal in the Software without restriction, including
                without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
                following conditions:
                <br />
                <br />
                The above copyright notice and this permission notice shall be included in all copies or substantial
                portions of the Software.
                <br />
                <br />
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
                SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F87900] mb-4">Contact</h2>
            <p className="text-zinc-300 mb-4">If you have any questions about these terms, please contact us:</p>
            <p className="text-zinc-300">
              Email: contact@example.com
              <br />
              GitHub:{" "}
              <a
                href="https://github.com/yourusername/google-news-rss-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F87900] hover:text-[#F8B700]"
              >
                github.com/degeniusone/google-news-rss-generator
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-500">Last updated: March 31, 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}

