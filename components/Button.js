// components/Button.js
import React from 'react'
import clsx from 'clsx'

/**
 * Button component with variants: primary, secondary, outline, disabled
 * @param {"primary"|"secondary"|"outline"} variant
 * @param {boolean} disabled
 * @param {React.ReactNode} children
 * @param {string} className
 * @param {(...args) => void} onClick
 */
export default function Button({
  variant = 'primary',
  disabled = false,
  children,
  className = '',
  ...props
}) {
  const baseStyles = 'px-md py-sm font-medium rounded-md transition focus:outline-none focus:ring-2'

  const variantStyles = {
    primary: clsx(
      'text-white',
      'bg-primary',
      'hover:bg-primary-dark',
      'focus:ring-primary-light'
    ),
    secondary: clsx(
      'text-white',
      'bg-secondary',
      'hover:bg-secondary-dark',
      'focus:ring-secondary-light'
    ),
    outline: clsx(
      'text-primary',
      'border border-primary',
      'hover:bg-primary-light',
      'focus:ring-primary-light'
    )
  }

  const disabledStyles = 'opacity-50 cursor-not-allowed'

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        disabled && disabledStyles,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
