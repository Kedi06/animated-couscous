const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`[EVENT] Girş Yaptı ${client.user.tag}`.magenta);

        client.user.setPresence({
            activities: [
                { 
                    name: 'KediDev',
                    type: ActivityType.Watching 
                }
            ],
            status: 'idle'
        });
    }
}