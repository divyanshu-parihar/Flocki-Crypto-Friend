import { bot } from './bot';

(async () => {
    try {
        console.log('Bot started successfully');
        await bot.launch();

    } catch (error) {
        console.error('Failed to start bot:', error);
    }
})();