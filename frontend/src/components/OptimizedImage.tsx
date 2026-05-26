import React, { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  shouldLoad?: boolean
  style?: React.CSSProperties
  onLoad?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  shouldLoad = true,
  style,
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!shouldLoad) {
      setIsLoaded(false)
      return
    }

    const img = new Image()
    img.src = src

    img.onload = () => {
      setIsLoaded(true)
      onLoad?.()
    }

    return () => {
      img.onload = null
    }
  }, [src, onLoad, shouldLoad])

  return (
    <>
      {/* Placeholder while loading */}
      {!isLoaded && shouldLoad && (
        <div
          className={`${className} animate-pulse bg-slate-200`}
          style={style}
          aria-hidden="true"
        />
      )}

      {shouldLoad ? (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{
            ...style,
            visibility: isLoaded ? 'visible' : 'hidden',
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...{ fetchpriority: priority ? 'high' : 'auto' }}
        />
      ) : null}
    </>
  )
}

export default OptimizedImage
