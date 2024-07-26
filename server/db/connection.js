const mongoose = require('mongoose');

const url = `mongodb+srv://chat_app_admin:ChatApp123@cluster0.8ocd7qf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// const client = new MongoClient(url)

// async function listDatabases(client){
//     databasesList = await client.db().admin().listDatabases();
 
//     console.log("Databases:");
//     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };

// async function run(){
//     try{
//         await client.connect();
//         await listDatabases(client);

//         console.log("Pinged your deployment");
//     }

//     catch(e){
//         console.error(e)
//     }

//     finally{
//         await client.close();
//         console.log('Closed client');
//     }
// }

// module.exports = {run};

mongoose.connect(url).then(() => console.log('Connected to DB')).catch((e) => console.log('Error', e))