'use client'

import { useState } from 'react'

interface ConfigFormProps {
  onSubmit: (config: {
    apiId: string
    apiHash: string
    phone: string
    groupId: string
    delay: number
  }) => void
  isLoading: boolean
  csvReady: boolean
}

export default function ConfigForm({
  onSubmit,
  isLoading,
  csvReady,
}: ConfigFormProps) {
  const [config, setConfig] = useState({
    apiId: '',
    apiHash: '',
    phone: '',
    groupId: '',
    delay: 30,
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setConfig((prev) => ({
      ...prev,
      [name]: name === 'delay' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!config.apiId || !config.apiHash || !config.phone || !config.groupId) {
      alert('Please fill in all required fields')
      return
    }

    onSubmit(config)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* API ID */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
          API ID <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="apiId"
          value={config.apiId}
          onChange={handleInputChange}
          placeholder="e.g., 26015605"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-telegram-blue focus:outline-none focus:ring-1 focus:ring-telegram-blue transition"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Get from my.telegram.org
        </p>
      </div>

      {/* API Hash */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
          API Hash <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="apiHash"
            value={config.apiHash}
            onChange={handleInputChange}
            placeholder="e.g., 32528923bcd3e948341aaf5fe2a250b7"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-telegram-blue focus:outline-none focus:ring-1 focus:ring-telegram-blue transition pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 text-sm"
          >
            {showPassword ? '✕' : '○'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Get from my.telegram.org
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
          Phone Number <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={config.phone}
          onChange={handleInputChange}
          placeholder="+2348135169887"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-telegram-blue focus:outline-none focus:ring-1 focus:ring-telegram-blue transition"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          With country code (e.g., +1, +234)
        </p>
      </div>

      {/* Group ID */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
          Group ID or Link <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="groupId"
          value={config.groupId}
          onChange={handleInputChange}
          placeholder="e.g., -1002502451021 or @groupname"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-telegram-blue focus:outline-none focus:ring-1 focus:ring-telegram-blue transition"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Numeric ID or @username
        </p>
      </div>

      {/* Delay */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
          Delay between requests (seconds)
        </label>
        <select
          name="delay"
          value={config.delay}
          onChange={handleInputChange}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:border-telegram-blue focus:outline-none focus:ring-1 focus:ring-telegram-blue transition"
        >
          <option value={0}>No delay (faster, risky)</option>
          <option value={5}>5 seconds (recommended min)</option>
          <option value={15}>15 seconds</option>
          <option value={30}>30 seconds (recommended)</option>
          <option value={60}>60 seconds</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Higher delay reduces risk of Telegram restrictions
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !csvReady}
        className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-all mt-4 sm:mt-6 text-sm sm:text-base ${
          isLoading || !csvReady
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-telegram-blue hover:bg-blue-600 text-white cursor-pointer shadow-lg hover:shadow-xl'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⟳</span>
            Adding Members...
          </span>
        ) : (
          'Add Members to Group'
        )}
      </button>

      {!csvReady && (
        <p className="text-center text-gray-400 text-xs sm:text-sm">
          Upload a CSV file to enable adding members
        </p>
      )}
    </form>
  )
}
