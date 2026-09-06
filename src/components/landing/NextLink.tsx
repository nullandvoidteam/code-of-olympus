import React from 'react'

export default function Link({ href, children, className, onClick, ...props }: any) {
  const handleClick = (e: any) => {
    e.preventDefault()
    
    if (href === '/login' || href === '/signup') {
      window.dispatchEvent(new Event('navigate-auth'))
    } else if (href && href.startsWith('#')) {
      const element = document.getElementById(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    
    if (onClick) onClick(e)
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
