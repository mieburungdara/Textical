const notifier = require('node-notifier');
const path = require('path');

/**
 * System Notifier Utility
 * Sends desktop notifications with sound.
 */
class SystemNotifier {
    /**
     * Send a notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} [type='info'] - Type of notification (info, warn, error)
     */
    static notify(title, message, type = 'info') {
        const iconPath = path.join(__dirname, '../../../public/favicon.ico'); // Adjust if icon exists
        
        notifier.notify({
            title: title || 'Textical Engine',
            message: message || 'Task completed!',
            sound: true, // Play system sound
            wait: false,
            // App ID is important for Windows notifications to show properly
            appID: 'Textical.RPG.Engine'
        });
        
        console.log(`[NOTIFY] ${title}: ${message}`);
    }

    static success(message) {
        this.notify('Success', message, 'info');
    }

    static warning(message) {
        this.notify('Warning', message, 'warn');
    }

    static error(message) {
        this.notify('Error', message, 'error');
    }
}

module.exports = SystemNotifier;
