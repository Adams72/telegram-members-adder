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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="text-4xl">
          {isSuccess ? '✓' : '⚠'}
        </div>
        <div className="flex-1">
          <h2 className={`text-2xl font-semibold mb-4 ${
            isSuccess ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isSuccess ? 'Members Added Successfully!' : 'Process Completed'}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Processed</p>
                <p className="text-2xl font-bold text-white">{totalMembers}</p>
              </div>
              <div className="bg-green-900 rounded-lg p-4">
                <p className="text-green-300 text-sm">Successfully Added</p>
                <p className="text-2xl font-bold text-green-400">{successCount}</p>
              </div>
              <div className={`rounded-lg p-4 ${
                failureCount > 0 ? 'bg-red-900' : 'bg-gray-700'
              }`}>
                <p className={`text-sm ${failureCount > 0 ? 'text-red-300' : 'text-gray-400'}`}>
                  Failed
                </p>
                <p className={`text-2xl font-bold ${failureCount > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {failureCount}
                </p>
              </div>
            </div>

            {results.message && (
              <div className={`p-4 rounded-lg ${
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
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Details
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {results.details.map((detail: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded text-sm ${
                        detail.success
                          ? 'bg-green-900/20 text-green-300'
                          : 'bg-red-900/20 text-red-300'
                      }`}
                    >
                      <span className="font-medium">{detail.member}</span>
                      {detail.reason && (
                        <span className="text-xs ml-2">- {detail.reason}</span>
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
