import React from 'react'

export default function Image({ src, alt, width, height, className, fill, priority, ...props }: any) {
  return (
    <img 
      src={src} 
      alt={alt || ''} 
      width={width} 
      height={height} 
      className={className}
      {...(fill ? { style: { objectFit: 'cover', width: '100%', height: '100%' } } : {})}
      {...props} 
    />
  )
}
