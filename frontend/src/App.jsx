import { useState } from 'react'

function App() {
  const [macAddress, setMacAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateMAC = (mac) => {
    const pattern = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/
    return pattern.test(mac)
  }

  const formatMAC = (value) => {
    // Remove all non-hex characters
    const cleaned = value.replace(/[^0-9A-Fa-f]/g, '')

    // Add colons every 2 characters
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || cleaned

    // Limit to MAC address length
    return formatted.slice(0, 17)
  }

  const handleInputChange = (e) => {
    const formatted = formatMAC(e.target.value)
    setMacAddress(formatted)
    setError('')
    setPassword('')
  }

  const handleGenerate = async () => {
    if (!validateMAC(macAddress)) {
      setError('Invalid MAC address format. Expected: AA:BB:CC:DD:EE:FF')
      return
    }

    setLoading(true)
    setError('')
    setPassword('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mac: macAddress }),
      })

      const data = await response.json()

      if (data.success) {
        setPassword(data.password)
      } else {
        setError(data.error || 'Failed to generate password')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && validateMAC(macAddress)) {
      handleGenerate()
    }
  }

  const isValid = validateMAC(macAddress)

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 min-h-screen py-8">
      <div className="space-y-6 w-full max-w-md">
        <div className="text-center">
          <h1 className="font-bold text-gray-900 text-3xl">
            Algérie Télécom's Fiberhome HG6145F1 Password Generator
          </h1>
        </div>

        <div className="space-y-6 bg-white shadow-sm p-8 rounded-lg">
          <div>
            <label htmlFor="mac" className="block mb-2 font-medium text-gray-700 text-sm">
              MAC Address
            </label>
            <input
              id="mac"
              type="text"
              value={macAddress}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="AA:BB:CC:DD:EE:FF"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                macAddress && !isValid
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              maxLength={17}
            />
            {macAddress && !isValid && (
              <p className="mt-1 text-red-600 text-sm">
                Invalid format. Use: AA:BB:CC:DD:EE:FF
              </p>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!isValid || loading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition ${
              isValid && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Password'}
          </button>

          {error && (
            <div className="bg-red-50 p-4 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {password && (
            <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
              <p className="mb-1 text-gray-600 text-sm">Generated Password:</p>
              <p className="font-mono font-bold text-green-800 text-xl select-all">
                {password}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm p-6 rounded-lg space-y-4 text-sm text-gray-600">
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">Credits:</p>
            <p>
              Password generation algorithm by{' '}
              <a
                href="https://github.com/theeyepatch07/HG6145F1_PasswordGen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                @theeyepatch07
              </a>
            </p>
            <p className="text-xs text-gray-500">
              This website decompiled the APK, extracted the function, converted it to Go backend, and hosted a frontend for convenience.
            </p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="font-semibold text-gray-700">Have methods for other Algérie Télécom routers?</p>
            <p>
              Please share them in our Telegram group:{' '}
              <a
                href="https://t.me/FTTHALGERIAGROUP"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                FTTH Algeria Group
              </a>
            </p>
            <p className="text-xs text-gray-500">
              We'll add them to this website if possible.
            </p>
          </div>

          <div className="border-t pt-4">
            <p>
              Source code:{' '}
              <a
                href="https://github.com/rainxh11/AlgerieTelecomRouterPassword"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
