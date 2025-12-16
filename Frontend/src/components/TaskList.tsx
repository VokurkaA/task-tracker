"use client";

import {useState} from "react";
import {Alert, Button, Checkbox, CheckboxControl, CheckboxIndicator, Surface} from "@heroui/react";
import {useRespondToInvite, useTasks, useUpdateTask} from "../hooks/useTasks.ts";
import {useAuth} from "../hooks/useAuth.ts";
import NewTaskModal from "./NewTaskModal.tsx";
import TaskDetailModal from "./TaskDetailModal.tsx";
import {ShareStatus, type Task,} from "../types.ts";

export default function TaskList() {
    const {data: tasks, isError} = useTasks();
    const {mutate: updateTask} = useUpdateTask();
    const {mutate: respond} = useRespondToInvite();
    const {user} = useAuth();

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleToggle = (id: string, currentStatus: boolean) => {
        updateTask({id, updates: {isCompleted: !currentStatus}});
    };

    return (<Surface className="mt-24 min-w-lg p-8 rounded-t-lg">
        <NewTaskModal/>

        {isError && <Alert status="danger">Failed to load tasks.</Alert>}

        {tasks && tasks.length > 0 && (<div className="space-y-4 mt-6">
            {tasks.map((t) => {
                const myShare = t.sharedWith.find(u => u.userId === user?.id);
                const isPending = myShare?.status === ShareStatus.PENDING;

                if (isPending) {
                    return (
                        <div key={t.id} className="border p-4 rounded flex justify-between items-center bg-default-100">
                            <div>
                                <p className="font-bold">Invitation: {t.title}</p>
                                <p className="text-sm text-default-500">Shared by owner</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="primary"
                                        onPress={() => respond({taskId: t.id, accept: true})}>Accept</Button>
                                <Button size="sm" variant="danger-soft"
                                        onPress={() => respond({taskId: t.id, accept: false})}>Decline</Button>
                            </div>
                        </div>)
                }

                return (<div key={t.id} className="flex items-center gap-3 group">
                    <Checkbox
                        isSelected={t.isCompleted}
                        onChange={() => handleToggle(t.id, t.isCompleted)}
                    >
                        <CheckboxControl>
                            <CheckboxIndicator/>
                        </CheckboxControl>
                    </Checkbox>

                    <div
                        className="flex-1 cursor-pointer flex justify-between items-center p-2 rounded hover:bg-default-100 transition-colors"
                        onClick={() => setSelectedTask(t)}
                    >
                            <span className={t.isCompleted ? "line-through text-default-400" : ""}>
                                {t.title}
                            </span>
                        <div className="flex items-center gap-2">
                            {t.subtasks.length > 0 && (<span className="text-xs text-default-400">
                                        {t.subtasks.filter(s => s.isComplete).length}/{t.subtasks.length}
                                    </span>)}
                            <span className="text-xs text-default-400 border px-1 rounded">
                                    {t.category}
                                </span>
                        </div>
                    </div>
                </div>);
            })}
        </div>)}

        {selectedTask && (<TaskDetailModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
        />)}
    </Surface>);
}