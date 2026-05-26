import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { geoapifyApi, GeocodingResult } from '../services/geoapify'

interface AddressAutocompleteProps {
  onChange: (value: string, coordinates?: { lat: number; lon: number }) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onChange,
  placeholder = 'Enter address...',
  className = '',
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setSelectedAddress(inputValue)
    onChange(inputValue)

    if (inputValue.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const results = await geoapifyApi.autocomplete(inputValue, 5)
      setSuggestions(results)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Address autocomplete failed:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSuggestion = (suggestion: GeocodingResult) => {
    setSelectedAddress(suggestion.formatted)
    onChange(suggestion.formatted, { lat: suggestion.lat, lon: suggestion.lon })
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedAddress}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`input pr-10 ${className}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <MapPin className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.lat}-${suggestion.lon}-${index}`}
              className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="text-sm font-medium text-slate-900">
                {suggestion.address.name && (
                  <span className="font-semibold">{suggestion.address.name}, </span>
                )}
                {suggestion.address.street && (
                  <span>{suggestion.address.street}</span>
                )}
                {suggestion.address.house_number && (
                  <span> {suggestion.address.house_number}</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {suggestion.address.city && (
                  <span>{suggestion.address.city}</span>
                )}
                {suggestion.address.county && (
                  <span>, {suggestion.address.county}</span>
                )}
                {suggestion.address.state && (
                  <span>, {suggestion.address.state}</span>
                )}
                {suggestion.address.country && (
                  <span>, {suggestion.address.country}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
