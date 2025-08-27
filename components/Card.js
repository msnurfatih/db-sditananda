// components/Card.js
import React from 'react'

/**
 * Generic Card container
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white p-md rounded-lg shadow ${className}`}>
      {children}
    </div>
  )
}
