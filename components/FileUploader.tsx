'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'

interface FileUploaderProps {
  onFileUpload: (data: Array<{ username_or_phone: string }>) => void
  csvData: Array<{ username_or_phone: string }> | null
}

export default function FileUploader({
  onFileUpload,
  csvData,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const data = (results.data as any[])
            .filter((row) => row.username_or_phone && row.username_or_phone.trim())
            .map((row) => ({
              username_or_phone: row.username_or_phone.trim(),
            }))

          if (data.length === 0) {
            setError(
              'No valid members found. Ensure CSV has "username_or_phone" column.'
            )
            return
          }

          onFileUpload(data)
          setError(null)
        } else {
          setError('CSV file is empty')
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`)
      },
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive
            ? 'border-telegram-blue bg-blue-950/20'
            : 'border-gray-600 hover:border-telegram-blue'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center gap-3"
        >
          <svg
            className="w-12 h-12 text-telegram-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <div className="text-center">
            <p className="text-white font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-gray-400 text-sm mt-1">
              CSV file (Max 10MB)
            </p>
          </div>
        </button>
      </div>

      {csvData && csvData.length > 0 && (
        <div className="mt-4 bg-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">
                Loaded Members
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {csvData.length} member(s) ready to add
              </p>
            </div>
            <button
              onClick={() => onFileUpload([])}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
