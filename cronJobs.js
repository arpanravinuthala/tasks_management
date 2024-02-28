const cron = require('node-cron');
const twilio = require('twilio');

// Twilio credentials
const accountSid = 'AC1ac4cad690ab696cd5d7a1dc461291fd';
const authToken = '3969cb6dc8a78bcb2bc85708a8c00087';
const twilioClient = twilio(accountSid, authToken);

// Function to change priority of tasks based on due date
async function changeTaskPriority(req) {
    try {
        const tasksCollectionObj = req.app.get('tasksCollectionObj');
        // Find tasks with past due dates
        const overdueTasks = await tasksCollectionObj.find({ due_date: { $lt: new Date() } }).toArray();
        // Update priorities based on due date
        for (const task of overdueTasks) {
            let priority = 0;
            // Your logic to determine priority based on due date
            // For example:
            if (task.due_date < new Date()) {
                priority = 2;
            } else if (task.due_date < new Date(new Date().getTime() + 24 * 60 * 60 * 1000)) {
                priority = 1;
            }
            await tasksCollectionObj.updateOne({ _id: task._id }, { $set: { priority } });
        }
    } catch (error) {
        console.error('Error changing task priority:', error);
    }
}

// Function to initiate voice calls using Twilio
async function initiateVoiceCalls(req) {
    try {
        const tasksCollectionObj = req.app.get('tasksCollectionObj');
        // Find tasks with past due dates and whose users haven't been called yet
        const overdueTasks = await tasksCollectionObj.find({ due_date: { $lt: new Date() }, called: { $ne: true } }).toArray();
        // Sort tasks by user priority
        overdueTasks.sort((a, b) => a.user.priority - b.user.priority);
        // Iterate through tasks and initiate calls
        for (const task of overdueTasks) {
            // Your Twilio calling logic here
            // For example:
            await twilioClient.calls.create({
                url: 'http://example.com/voice.xml',
                to: task.user.phone_number,
                from: 'your_twilio_phone_number'
            });
            // Mark user as called in the database
            await tasksCollectionObj.updateOne({ _id: task._id }, { $set: { called: true } });
        }
    } catch (error) {
        console.error('Error initiating voice calls:', error);
    }
}

// Schedule cron job for changing priority of tasks (every hour)
cron.schedule('0 * * * *', async () => {
    await changeTaskPriority(req);
});

// Schedule cron job for voice calling using Twilio (every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
    await initiateVoiceCalls(req);
});

module.exports = {
    changeTaskPriority,
    initiateVoiceCalls
};
