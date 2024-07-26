import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input'
import Button from '../../components/Button'

const Form = ({
    isSignInPage = true,
}) => {

    const [data, setData] = useState ({
        ...(!isSignInPage && {
            fullName: ''
        }),
        email: '',
        password: ''
    })

const navigate = useNavigate()    
    
  return (
    <div className='flex justify-center items-center'>
        <div className="bg-white w-[600px] h-[600px] shadow-lg rounded-lg flex flex-col justify-center items-center">
            <div className="text-4xl font-extrabold">Welcome {isSignInPage?'Back':''}</div>
            <div className='text-xl font-light mb-14'>{isSignInPage?'Sign in to get started':'Sign up now to get started'}</div>

            <form onSubmit={()=>{}} className='w-full flex flex-col justify-center items-center'>
                {
                    !isSignInPage && <Input label="Full name" name="name" placeholder='Enter your name' className="mb-5"
                    value={data.fullName} onChange={(e) => setData({...data, fullName: e.target.value})}
                    />
                }
                <Input label="Email address" name="email" placeholder="Enter your email" value={data.email} onChange={(e)=>setData({...data, 
                    email: e.target.value})} className="mb-5 w-[50%]"/>

                <Input label="Password" name="password" placeholder="Enter your password" value={data.password} onChange={(e) =>setData({
                    ...data, password: e.target.value
                })} className="mb-10 w-[50%]"/>

                <Button label={isSignInPage?'Sign in':'Sign up'} className="w-[50%] mb-2"/>
                <div >{isSignInPage? "Don't have an account?": 'Already have an account?'} <span onClick={()=>navigate(`/users/${isSignInPage?'sign_up':'sign_in'}`)} className='text-primary cursor-pointer underline'>{isSignInPage?'Sign up':'Sign in'}</span></div>

            </form>
        </div>
    </div>
  )
}

export default Form
