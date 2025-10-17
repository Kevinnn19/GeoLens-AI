'use client'

import { useState, useEffect } from 'react'
import { X, Key, Eye, EyeOff } from 'lucide-react'
import { getStoredToken, setStoredToken } from '@/lib/api'

interface ApiTokenModalProps {
  isOpen: boolean
  onClose: () => void
  onTokenSet: (token: string) => void
}

export function ApiTokenModal({ isOpen, onClose, onTokenSet }: ApiTokenModalProps) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const storedToken = getStoredToken()
      if (storedToken) {
        setToken(storedToken)
      }
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      setStoredToken(token.trim())
      onTokenSet(token.trim())
      onClose()
    }
  }

  const handleClear = () => {
    setToken('')
    setStoredToken('')
    onTokenSet('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Token
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Enter your API token
            </label>
            <div className="relative">
              <input
                id="token"
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Your API token is stored locally and used to authenticate with the backend.</p>
            <p className="mt-1">
              Get your token from the backend admin or create one using:
            </p>
            <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              python manage.py create_api_user
            </code>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Save Token
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
