import React from 'react'

const Button = ({
    label = 'Button',
    type = 'button',
    className = '',
    inputClassName='',
    disabled = false,
}) => {
  return (
    <button type={type} className={`text-white bg-primary hover:bg-primary focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm text-center px-5 py-2.5 me-2 mb-2 focus:outline-none ${inputClassName} ${className}`} disabled={disabled}>
        {label}</button>
  )
}

export default Button
