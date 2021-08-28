const mongoose = require('mongoose');
const express = require('express');
const app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
	.connect('mongodb://localhost:27017/zerotoone')
	.then(client => {
		// check if there's no index in users collection in name prop then create it
		client.connections[0].collections.users.createIndex({ name: 'text' });
		console.log(`Connected to database 🚀`);
	})
	.catch(e => console.log('error connecting to db' + e));
