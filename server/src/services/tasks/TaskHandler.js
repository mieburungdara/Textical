/**
 * Base TaskHandler
 * Contract for specific task type completion and duration logic.
 */
class TaskHandler {
    constructor(db) { this.db = db; }
    
    async complete(task) { throw new Error("Not implemented"); }
    async getDuration(task, user) { return 5; }
    async getCompletionPayload(task) { return {}; }
}

module.exports = TaskHandler;
