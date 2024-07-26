import React from 'react'
import Input from '../../components/Input'
import Avatar from '../../assets/avatar.svg'
import Phone from '../../assets/phone.svg'
import Add from '../../assets/addMedia.svg'
import Send from '../../assets/send.svg'

const Dashboard = () => {
  const contacts = [
    {
      name: 'John',
      status: 'Available',
      img: Avatar
    },

    {
      name: 'Bravo',
      status: 'Available',
      img: Avatar
    },

  ]
  return (
    <div className='w-screen flex'>
        <div className="w-[25%] h-screen bg-secondary">
            <div className='flex justify-center items-center my-8 mx-14'>
              <img src={Avatar} alt="" width={75} height={75}/>
              <div className='ml-8'>
                <h3 className='text-lg'>Account name</h3>
                <p className='text-lg font-light'>My Account</p>
              </div>
            </div>
        <hr/>
        <div className='mx-14 mt-10'>
          <div className='text-primary'>Messages</div>
          <div>
            {
              contacts.map(
                ({name, status, img}) => {
                  return (
                    <div className='flex items-center py-8 border-b border-b-gray-300'>
                       <div className='flex items-center cursor-pointer '>
                        <div>
                          <img src={img} width={60} height={60} alt="" className="src" />
                        </div>
                        <div className="ml-8">
                            <h3 className="text-lg">{name}</h3>
                            <p className='text-sm font-light text-gray-600'>{status}</p>
                        </div>
                        </div>
                    </div>
                  )
                }
              )
            }
          </div>
        </div>
        </div>
        <div className="w-[50%] h-screen bg-white flex flex-col items-center">
          <div className='w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 '>
                <div className='cursor-pointer'><img src={Avatar} width={60} height={60} alt="" /></div>
                <div className='ml-6 mr-auto'>
                  <h3 className='text-lg font-semibold '>John</h3>
                  <p className='text-sm font-light text-gray-600'>Online</p>
                </div>
                <div className='cursor-pointer'><img src={Phone} alt=''></img></div>
          </div>
          <div className='h-[75%] border w-full overflow-scroll shadow-lg'>
              <div className='h-[1000px] p-14'>
                <div className=" max-w-[40%] bg-secondary rounded-b-xl rounded-tr-xl p-4 mb-6">
                    Lorem ipsum dolor sit amet.
                  </div>    
                <div className=" w-[300px] bg-primary rounded-b-xl rounded-tl-xl ml-auto text-white p-4 mb-6">
                  Lorem ipsum dolor sit amet.
                </div>
              </div>
          </div>
          <div className="p-14 w-full flex items-center">
            <Input inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none' placeholder='Type a message...'/>
            <div className="ml-4 p-2 cursor-pointer bg-secondary rounded-full">
                  <img src={Send} alt="" />
            </div>
            <div className="">
                <img src={Add} alt="" />
            </div>
          </div>
        </div>
        
        <div className="w-[25%] h-screen bg-light"></div>
    </div>
  )
}

export default Dashboard
