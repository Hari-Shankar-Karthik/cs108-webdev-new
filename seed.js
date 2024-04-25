// TODO: Implement seed.js
// FOR NOW: Only seed the chat with a few messages

const mongoose = require('mongoose');
const fs = require('fs').promises;

const Student = require('./models/student');
const Chat = require('./models/chat');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/looking-for-a-date')
    .then(async () => {
        console.log('MongoDB connected');
        try {
            // Clear existing data
            await Student.deleteMany({});
            console.log('Existing students data cleared from database');
            
            // Read data from students.json
            const studentsData = JSON.parse(await fs.readFile('./dbs/students.json', 'utf-8'));
            // Insert students data into database
            await Student.insertMany(studentsData);
            console.log('New students data inserted into database');

            // Clear existing chat data
            await Chat.deleteMany({});
            console.log('Existing chat data cleared from database');

            // Seed chat with a few messages
            const allStudents = await Student.find({});
            const allRollNumbers = allStudents.map(student => student['IITB Roll Number']);
            console.log(`allRollNumbers: ${allRollNumbers}`);
            const chatSeedSize = 100;
            for(let i = 0; i < chatSeedSize; i++) {
                const from = allRollNumbers[Math.floor(Math.random() * allRollNumbers.length)];
                const to = allRollNumbers[Math.floor(Math.random() * allRollNumbers.length)];
                if(from !== to) {
                    const chat = new Chat({
                        from,
                        to,
                        message: `Message ${i + 1}`,
                    });
                    await chat.validate();
                    await chat.save();
                    console.log(`from: ${from}, to: ${to}`);
                }
            }
            console.log('Chat data seeded into database');

            // Close MongoDB connection
            mongoose.connection.close();
        } catch (err) {
            console.error('Error:', err);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
    });