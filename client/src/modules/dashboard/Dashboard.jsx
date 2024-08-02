import React, { useEffect } from 'react'
import Input from '../../components/Input'
import Avatar from '../../assets/avatar.svg'
import Phone from '../../assets/phone.svg'
import Add from '../../assets/addMedia.svg'
import Send from '../../assets/send.svg'
import { useState } from 'react'
import { io } from 'socket.io-client'

// window.onbeforeunload = () => {localStorage.clear();}
const Dashboard = () => {  
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user:detail')));
  const [conversations, setConversation] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);

console.log('messages',messages);
useEffect(()=>{

  setSocket(io('http://localhost:3002'))
}, []);

useEffect(() =>{

  socket?.emit('addUser',user?.id);
  socket?.on('getUsers', users =>{
    console.log('Active Users', users);
    
  });

  socket?.on('getMessage', data =>{
    console.log(data);
    setMessages(prev => ( 
      console.log("Prev",prev),{ 
      ...prev, 
      message: [...prev.message,{ user: data.user, message: data.message} ]
    }));

  });
}, [socket]);

useEffect(()=>{
  
  const loggedInUser = JSON.parse(sessionStorage.getItem('user:detail'));

  const fetchConversations = async() =>{
    const res = await fetch(`http://localhost:3000/api/conversation/${loggedInUser?.id}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
    });
    const resData = await res.json();
    setConversation(resData);
  }
  fetchConversations();
}, [])

useEffect(()=> {
  const fetchUsers = async() => {
    const res = await fetch(`http://localhost:3000/api/users/${user?.id}`, {
      method: 'GET',
      headers:{
        'Content-type':'application/json',
      }
    });
      const resData = await res.json();
      setUsers(resData);
  }

  fetchUsers()
}, [])  

const fetchMessages = async (conversationId, receiver) => {
  const res = await fetch(`http://localhost:3000/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`,{
    method:'GET',
    headers:{
      'Content-type':'application/json',
    },
  });

  const resMsg = await res.json();
  setMessages({message: resMsg, receiver, conversationId});

}

const sendMessage = async () => {
  
  setMessage('');
    
  socket?.emit('sendMessage',{
      senderId: user?.id,
      receiverId: messages?.receiver?.receiverId,
      message,
      conversationId: messages?.conversationId
  });

  const res = await fetch(`http://localhost:3000/api/message`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      conversationId: messages?.conversationId,
      senderId: user?.id,
      message,
      receiverId: messages?.receiver?.receiverId
    })
  });
}

  return (
    <div className='w-screen flex'>
        <div className="w-[25%] h-screen bg-secondary">
            <div className='flex justify-center items-center my-8 mx-14'>
              <img src={Avatar} alt="" width={75} height={75}/>
              <div className='ml-8'>
                
                <h3 className='text-lg'>{user?.fullName}</h3>
                <p className='text-lg font-light'>My account</p>
              </div>
            </div>
        <hr/>
        <div className='mx-14 mt-10'>
          <div className='text-primary'>Messages</div>
          <div>
            {
              conversations.length > 0?
                conversations.map(
                  ({conversationId, user}) => {
                    return (
                      <div key={conversationId} className='flex items-center py-8 border-b border-b-gray-300'>
                        <div className='flex items-center cursor-pointer ' onClick={()=>fetchMessages(conversationId, user)
                       }>
                        <div>
                          <img src={Avatar} width={60} height={60} alt="" className="src" />
                        </div>
                        <div className="ml-8">
                            <h3 className="text-lg">{user?.fullName}</h3>
                            <p className='text-sm font-light text-gray-600'>{user.email}</p>
                        </div>
                        </div>
                    </div>
                  )
                }
              ): <div className='text-center text-lg font-bold mt-24'>No messages</div>
            }
          </div>
        </div>
        </div>
        <div className="w-[50%] h-screen bg-white flex flex-col items-center">
          {
            messages.receiver?.fullName && 
            <div className='w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 '>
                  <div className='cursor-pointer'><img src={Avatar} width={60} height={60} alt="" /></div>
                  <div className='ml-6 mr-auto'>
                    <h3 className='text-lg font-semibold '>{messages.receiver?.fullName}</h3>
                    <p className='text-sm font-light text-gray-600'>{messages.receiver?.fullName}</p>
                  </div>
                  <div className='cursor-pointer'><img src={Phone} alt=''></img></div>
            </div>
          }
          <div className='h-[75%] w-full overflow-scroll shadow-sm'>
              <div className='p-14'> 
                {
                  messages?.message?.length>0?
                    
                    
                    messages.message?.map(({message, user:{id} = {}}) => {
                        return(
                          <div className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${id === user?.id? 'bg-primary text-white rounded-tl-xl ml-auto':'bg-secondary rounded-b-xl rounded-tr-xl '}`}>
                            {
                                message
                            }
                        </div>
                        )
                      } 
                  ) : <div className="text-center text-lg font-bold mt-24">Select a conversation to get started</div>
                }
              </div>
          </div>
          {   
              messages?.receiver?.fullName &&
              <div className="p-14 w-full flex items-center">
              <Input value={message} onChange={(e) => setMessage(e.target.value)} inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none' placeholder='Type a message...'/>
              <div className={`ml-4 p-2 cursor-pointer bg-secondary rounded-full ${!messages && 'pointer-events-none'}`} onClick={()=>sendMessage()}>
                    <img src={Send} alt="" />
              </div>
              <div className="ml-2 p-2 cursor-pointer bg-light rounded-full">
                  <img src={Add} alt="" />
              </div>
            </div>
          }
          
        </div>
        
        <div className="w-[25%] h-screen bg-light px-8 py-16">
            <div className="text-primary text-lg">People</div>
        
            {
              users.length > 0?
              users.map(
                ({userId, user}) => {
                  return (
                    <div key={userId} className='flex items-center py-8 border-b border-b-gray-300'>
                      <div className='flex items-center cursor-pointer ' onClick={()=>fetchMessages('new', user)
                    }>
                        <div>
                          <img src={Avatar} alt="" className="w-[60px] h-[60px] rounded-full border border-primary" />
                        </div>
                        <div className="ml-6">
                            <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                            <p className='text-sm font-light text-gray-600'>{user?.email}</p>
                        </div>
                      </div>
                    </div>
                )
              }
            ): <div className='text-start text-sm font-semibold mt-24'>Your friends</div>
            }
        </div>
    </div>
  )
}

export default Dashboard
