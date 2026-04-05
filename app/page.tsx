'use client'

import { useState } from 'react'
import FileUploader from '@/components/FileUploader'
import ConfigForm from '@/components/ConfigForm'
import ResultsDisplay from '@/components/ResultsDisplay'

export default function Home() {
  const [csvData, setCsvData] = useState<Array<{ username_or_phone: string }> | null>(null)
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = (data: Array<{ username_or_phone: string }>) => {
    setCsvData(data)
  }

  const handleAddMembers = async (config: {
    apiId: string
    apiHash: string
    phone: string
    groupId: string
    delay: number
  }) => {
    if (!csvData || csvData.length === 0) {
      alert('Please upload a CSV file first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/add-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          members: csvData,
        }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error:', error)
      setResults({
        success: false,
        message: 'Error adding members. Please check your configuration.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-telegram-dark via-gray-900 to-black py-4 px-3 sm:py-6 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-10 mt-4 sm:mt-6">
          <div className="mb-2 sm:mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-telegram-blue to-cyan-400 bg-clip-text text-transparent mb-2">
              Telegram Members Adder
            </h1>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
              Efficiently add members to your Telegram groups using CSV files
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 lg:p-6 backdrop-blur">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-telegram-blue">1.</span> Upload CSV File
              </h2>
              <FileUploader onFileUpload={handleFileUpload} csvData={csvData} />
            </div>

            {csvData && csvData.length > 0 && (
              <div className="bg-green-900 border border-green-700 rounded-lg p-3 sm:p-4">
                <p className="text-green-100 text-sm sm:text-base">
                  ✓ {csvData.length} members ready to add
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 lg:p-6 backdrop-blur">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-telegram-blue">2.</span> Configure & Add
              </h2>
              <ConfigForm
                onSubmit={handleAddMembers}
                isLoading={isLoading}
                csvReady={csvData !== null && csvData.length > 0}
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-6 sm:mt-8">
            <ResultsDisplay results={results} />
          </div>
        )}

        {/* Help Section */}
        <section className="mt-10 sm:mt-14 lg:mt-16 bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">
            How to Use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 text-gray-300">
            <div>
              <h3 className="text-telegram-blue font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Step 1: Prepare CSV File
              </h3>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                Create a CSV file with a column named <code className="bg-gray-900 px-2 py-1 rounded">username_or_phone</code>. Add usernames (without @) or phone numbers (with country code) for members you want to add.
              </p>
              <p className="text-xs text-gray-400">
                Example:
                <br />
                <code className="bg-gray-900 px-2 py-1 rounded block mt-2 text-xs overflow-x-auto">
                  username_or_phone<br/>
                  john_doe<br/>
                  +2348135169887
                </code>
              </p>
            </div>

            <div>
              <h3 className="text-telegram-blue font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Step 2: Get Telegram Credentials
              </h3>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                You&apos;ll need:
              </p>
              <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 list-disc list-inside">
                <li><strong>API ID</strong> - Get from my.telegram.org</li>
                <li><strong>API Hash</strong> - Get from my.telegram.org</li>
                <li><strong>Phone Number</strong> - Your Telegram account phone</li>
                <li><strong>Group ID</strong> - The target group ID (or username)</li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-telegram-blue font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Step 3: Upload & Add
              </h3>
              <p className="text-xs sm:text-sm">
                Upload your CSV file, enter your Telegram credentials, set an appropriate delay time (to avoid flood restrictions), and click &quot;Add Members&quot;. The script will add each member with the specified delay between requests.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
