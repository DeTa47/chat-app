const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CORS = require('cors');
const io = require('socket.io')(3002,{
    cors:{
        origin: 'http://localhost:5173',
    }
});



const port = process.env.PORT || 3000;

const db = require('./db/connection');

//Connnect db
require('./db/connection');

//Import files
const Users = require('./models/users');
const Conversations = require('./models/Conversations');
const Messages  = require('./models/Messages');

// db.run().catch(console.dir)

//app use
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(CORS());

//Routes
app.get('/', (req, res)=>{
    res.send('Welcome');
})
//Socket.io

let users = [];
io.on('connection', socket =>{
    console.log(`User connected: ${socket.id}`);
    socket.on('addUser', userId=>{
        const isUserExist = users.find(user => user.userId === userId);
        if(!isUserExist)
        {
            const user = {userId, socketId: socket.id};
            users.push(user);
            io.emit('getUSers', users);
        }
       
    });

    socket.on('sendMessage', async ({senderId, receiverId, message, conversationId}) => {
        console.log(`sendMessage event received from senderId: ${senderId} to receiverId: ${receiverId}`);

        const receiver = await users.find(user => user.userId === receiverId);
        console.log('Receiver', receiver);
        const sender = await users.find(user => user.userId === senderId);
        console.log("Sender",sender);
        const user = await Users.findById(senderId);

        if (receiver){
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage',{
                senderId,
                message, 
                conversationId,
                receiverId,
                user: {id: user._id, fullName: user.fullName, email: user.email}
                });
            }   
        else{
            io.to(sender.socketId).emit('getMessage',{
                senderId,
                message,
                conversationId,
                receiverId,
                user:{id: user._id, fullName: user.fullName, email: user.email}
            })
        }
    });

    socket.on('disconnect',()=>{
        users = users.filter(user => user.socketId !== socket.id);
        console.log("Users in disconnect: ",users);
        io.emit('getUsers', users);
    });
});

app.post('/api/register', async (req, res, next)=>{
    try{
        const {fullName, email, password} = req.body;

        if(!fullName || !email || !password){
            res.status(400).send('Please fill all requested details');
        } else{

            const isAlreadyExist = await Users.findOne({email});

            if(isAlreadyExist){
                res.status(400).send('User already exists');
            }

            else{
                const newUser = new Users ({fullName, email});
                bcryptjs.hash(password, 8, async (err, hashedPassword)=>{
                    if (err) {
                        return res.status(500).send('Error hashing password');
                    }
                    newUser.set('password', hashedPassword);
                    await newUser.save();
                    next();
                });

                return res.status(200).send('User registered succefully');
            }

        }   
    }   

    catch(error){
            res.status(401).send(error);
    }
});

app.post('/api/login', async (req, res, next)=> {
    try{
        const {email, password} = req.body;

        if(!email||!password){
            res.status(400).send('Please fill all the details');
        }

        else{
            const user = await Users.findOne({email});
            if(!user){
                
                res.status(400).send('User does not exist');
            }
            else{
                const validateUser = await bcryptjs.compare(password, user.password);
                if(!validateUser){
                    res.status(400).send('User email or password is incorrect');
                }
                else{
                        const payload = {
                            userId: user._id,
                            email: user.email,

                        }

                        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'This_is_a_jwt_secret_key';
                        jwt.sign(payload, JWT_SECRET_KEY, {expiresIn: 84600}, async(err, token) =>{
                                await Users.updateOne({_id: user.id}, {
                                    $set: { token }
                                })
                        
                            user.save();
                            return res.status(200).json({user: {id:user._id, email: user.email, fullName: user.fullName}, token: user.token});
                        });

                       
                }
            }
        }
    }

    catch(error){
            console.log(error);
    }
})

app.post('/api/conversation', async (req, res)=>{
    try{
        const { senderId, receiverId } = await req.body;
        const newConversation = new Conversations({members: [senderId, receiverId]});
        await newConversation.save();
        res.status(200).send('Conversation created successfully')
    }

    catch(error){   
        console.log(error, 'Error');

    }
})

app.get('/api/conversation/:userId', async (req, res)=>{
    try{
        const userId = await req.params.userId;
        const conversations = await Conversations.find({members: {$in: [userId]}});
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
                const receiverId = conversation.members.find((member)=>member !== userId);
                const user = await Users.findById(receiverId);
                return{user: {receiverId: user._id, email: user.email, fullName: user.fullName}, conversationId: conversation._id };
        }))
        res.status(200).json(await conversationUserData);

        res.status(200).json(conversations);
        
    }
    
        catch (error) {
            
        }
    }
)

app.post('/api/message', async(req, res) => {
    try {
        const {conversationId, senderId, message, receiverId= ''} = await req.body;
        if(!senderId||!message) return res.status(400).send('Please fill all required fields');
        if( conversationId === 'new' && receiverId){
            const newConversation = new Conversations({members: [senderId, receiverId]});
            await newConversation.save();
            const newMessage = new Messages({conversationId: newConversation._id, senderId, message});
            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        }

        else if(!conversationId && !receiverId){
            return res.status(400).send('Fill all required fields');
        }
        const newMessage = new Messages({conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send('Message sent successfully');
    } catch (error) {
        
        console.log("Error:",error);
    }
})

app.get('/api/message/:conversationId', async (req, res) => {
    try {

        const checkMessages = async(conversationId) => {
            const messages = await Messages.find({conversationId});
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await Users.findById(message.senderId);
                return {user: {id:user._id, email: user.email, fullName: user.fullName}, message: message.message}
            }));
        res.status(200).json(await messageUserData);
        }

        const conversationId = req.params.conversationId;
        if(conversationId ==='new') {
            const checkConversation = await Conversations.find({members: {$all: [req.query.senderId, req.query.receiverId]}});
            if(checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id);
            }
            else{
                return res.status(200).json([]);
            }
        } else{
           checkMessages(conversationId);
        }

        
    } 
    catch (error) {
        console.log("Error:",error);
    }
})

app.get('/api/users/:userId', async (req, res) => {
    try { 
        const userId = req.params.userId;
        const users = await Users.find({_id:{$ne: userId}});
        const userData = await Promise.all(users.map(async (user) => {
            return {user: {email: user.email, fullName: user.fullName, receiverId: user._id}} 
        }));
        
        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, ()=>{
    console.log(port);
})