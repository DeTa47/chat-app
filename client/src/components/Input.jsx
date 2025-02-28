import React from 'react'

const Input = ({
    label='',
    name='',
    type='text',
    className='',
    isRequired=false,
    inputClassName='',
    placeholder='',
    value = '',
    onChange = () =>{},

}) => {
  return (
    <div className='w-[75%]'>
      <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-800">{label}</label>
      <input type={type} id={name} value={value} onChange={onChange} className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 ${className} ${inputClassName} block w-full p-2.5`} placeholder={placeholder} required={isRequired} />
    </div>
  )
}

export default Input
