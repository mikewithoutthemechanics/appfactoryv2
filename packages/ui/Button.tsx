/* MIT License: AppFactory-Final scaffold */
import React from 'react'

export function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        background: '#fff',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )
}
