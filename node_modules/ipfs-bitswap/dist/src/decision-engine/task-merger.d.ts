import type { Task } from './index.js';
export declare const DefaultTaskMerger: {
    /**
     * Indicates whether the given task has newer information than the active
     * tasks with the same topic.
     *
     * @param {Task} task
     * @param {Task[]} tasksWithTopic
     * @returns {boolean}
     */
    hasNewInfo(task: Task, tasksWithTopic: Task[]): boolean;
    /**
     * Merge the information from the given task into the existing task (with the
     * same topic)
     */
    merge(newTask: Task, existingTask: Task): void;
};
//# sourceMappingURL=task-merger.d.ts.map