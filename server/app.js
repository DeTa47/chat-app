const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 3000;

// const db = require('./db/connection');

// const Users  = require('./models/users')

//Connnect db
require('./db/connection');

//Import files
const Users = require('./models/users');
const Conversations = require('./models/Conversations');
const Messages  = require('./models/Messages')

// db.run().catch(console.dir)

//app use
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//Routes
app.get('/', (req, res)=>{
    res.send('Welcome');
})

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
                bcryptjs.hash(password, 10, (err, hashedPassword)=>{
                    newUser.set('password', hashedPassword);
                    newUser.save();
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
                                });
                        
                            user.save();
                            next();
                        });

                       res.status(200).json({user: { email: user.email, fullName: user.fullName}, token: user.token});
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

app.post('/api/conversation/:userId', async (req, res)=>{
    try{
        const userId = await req.params.userId;
        const conversations = await Conversations.find({members: {$in: [userId]}});
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
                const receiverId = conversation.members.find((member)=>member !== userId);
                const user = await Users.findById(receiverId);
                return{user: {email: user.email, fullName: user.fullName}, conversationId: conversation._id };
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
        const {conversationId, senderId, message} = await req.body;
        const newMessage = new Messages({conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send('Message sent successfully');
    } catch (error) {
        
        console.log("Error:",error);
    }
})

app.get('/api/message/:conservationId', async (req, res) => {
    try {
        const conversationId = req.params.conservationId;
        const messages = await Messages.find({conversationId});
        const messageUserData = Promise.all(messages.map(async (message) => {
            const user = await Users.findById(message.senderId);
            return {user: {email: user.email, fullName: user.fullName}, message: message.message}
        }));
        res.status(200).json(await messageUserData);
    } catch (error) {
        console.log("Error:",error);
    }
})

app.get('/api/users', async (req, res) => {
    try {
        const users = Users.find();
        const userData = users.map(async (user) => {
            return {user: {email: Users.email, fullName: Users.fullName}, userId: user._id}
        });
        res.status(200).json(await userData);
    } catch (error) {
        
    }
})

app.listen(port, ()=>{
    console.log(port);
})