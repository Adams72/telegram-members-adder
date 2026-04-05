'use client'

interface ResultsDisplayProps {
  results: any
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const isSuccess = results.success
  const successCount = results.successCount || 0
  const failureCount = results.failureCount || 0
  const totalMembers = successCount + failureCount

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 backdrop-blur">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="text-3xl sm:text-4xl flex-shrink-0">
          {isSuccess ? '✓' : '⚠'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 ${
            isSuccess ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isSuccess ? 'Members Added Successfully!' : 'Process Completed'}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm">Total Processed</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalMembers}</p>
              </div>
              <div className="bg-green-900 rounded-lg p-3 sm:p-4">
                <p className="text-green-300 text-xs sm:text-sm">Successfully Added</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400 mt-1">{successCount}</p>
              </div>
              <div className={`rounded-lg p-3 sm:p-4 ${
                failureCount > 0 ? 'bg-red-900' : 'bg-gray-700'
              }`}>
                <p className={`text-xs sm:text-sm ${failureCount > 0 ? 'text-red-300' : 'text-gray-400'}`}>
                  Failed
                </p>
                <p className={`text-xl sm:text-2xl font-bold mt-1 ${failureCount > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {failureCount}
                </p>
              </div>
            </div>

            {results.message && (
              <div className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                isSuccess
                  ? 'bg-green-900/20 border border-green-700'
                  : 'bg-yellow-900/20 border border-yellow-700'
              }`}>
                <p className={isSuccess ? 'text-green-300' : 'text-yellow-300'}>
                  {results.message}
                </p>
              </div>
            )}

            {results.details && results.details.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
                  Details
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-1.5 sm:space-y-2">
                  {results.details.map((detail: any, index: number) => (
                    <div
                      key={index}
                      className={`p-2 sm:p-3 rounded text-xs sm:text-sm ${
                        detail.success
                          ? 'bg-green-900/20 text-green-300'
                          : 'bg-red-900/20 text-red-300'
                      }`}
                    >
                      <span className="font-medium">{detail.member}</span>
                      {detail.reason && (
                        <span className="text-xs ml-1 sm:ml-2">- {detail.reason}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
