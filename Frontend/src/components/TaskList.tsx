"use client";

import {useMemo, useState} from "react";
import {Alert, Button, Checkbox, CheckboxControl, CheckboxIndicator, Chip, Surface} from "@heroui/react";
import {useRespondToInvite, useTasks, useUpdateTask} from "../hooks/useTasks.ts";
import {useAuth} from "../hooks/useAuth.ts";
import NewTaskModal from "./NewTaskModal.tsx";
import TaskDetailModal from "./TaskDetailModal.tsx";
import {ShareStatus, type Task} from "../types.ts";
import {Icon} from "@iconify/react";

type FilterType = 'all' | 'active' | 'completed';

export default function TaskList() {
    const {data: tasks, isError, isLoading} = useTasks();
    const {mutate: updateTask} = useUpdateTask();
    const {mutate: respond} = useRespondToInvite();
    const {user} = useAuth();

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');

    const handleToggle = (id: string, currentStatus: boolean) => {
        updateTask({id, updates: {isCompleted: !currentStatus}});
    };

    // Filter Logic
    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(t => {
            // Always show pending invites regardless of filter
            const myShare = t.sharedWith.find(u => u.userId === user?.id);
            if (myShare?.status === ShareStatus.PENDING) return true;

            if (filter === 'active') return !t.isCompleted;
            if (filter === 'completed') return t.isCompleted;
            return true;
        });
    }, [tasks, filter, user?.id]);

    const activeCount = tasks?.filter(t => !t.isCompleted).length || 0;

    if (isLoading) {
        return <div className="flex justify-center p-10"><Icon icon="gravity-ui:arrows-rotate-right"
                                                               className="animate-spin text-3xl text-default-300"/>
        </div>
    }

    return (<Surface
        className="min-w-full md:min-w-lg p-6 md:p-8 rounded-2xl shadow-sm border border-default-100 bg-background">

        {/* Header Section with Title, Count and New Task Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold">My Tasks</h1>
                <p className="text-default-500 text-sm">You have {activeCount} active tasks</p>
            </div>
            <NewTaskModal/>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-default-100 rounded-lg w-fit mb-6">
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (<button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f ? "bg-background shadow-sm text-foreground" : "text-default-500 hover:text-foreground"}`}
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>))}
        </div>

        {isError && <Alert status="danger" className="mb-4">Failed to load tasks.</Alert>}

        <div className="space-y-3">
            {/* Empty State Logic */}
            {(!tasks || tasks.length === 0) ? (<div
                    className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-default-200 rounded-xl">
                    <div className="bg-default-100 p-4 rounded-full mb-3">
                        <Icon icon="gravity-ui:list-ul" className="text-3xl text-default-400"/>
                    </div>
                    <h3 className="text-lg font-semibold">No tasks yet</h3>
                    <p className="text-default-500 max-w-xs mt-1">
                        Get started by creating your first task using the button above.
                    </p>
                </div>) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Icon icon="gravity-ui:check-circle" className="text-4xl text-default-300 mb-3"/>
                    <p className="text-default-500">No {filter} tasks found.</p>
                </div>) : (// Task List
                filteredTasks.map((t) => {
                    const myShare = t.sharedWith.find(u => u.userId === user?.id);
                    const isPending = myShare?.status === ShareStatus.PENDING;

                    // Pending Invitation Card
                    if (isPending) {
                        return (<div key={t.id}
                                     className="border border-warning-200 bg-warning-50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <Icon icon="gravity-ui:envelope" className="text-warning-500 text-xl"/>
                                <div>
                                    <p className="font-bold text-warning-900">Invited to: {t.title}</p>
                                    <p className="text-xs text-warning-700">Shared by {t.ownerId}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button size="sm"
                                        className="flex-1 sm:flex-none bg-warning-500 text-white hover:bg-warning-600"
                                        onPress={() => respond({taskId: t.id, accept: true})}>Accept</Button>
                                <Button size="sm" variant="tertiary" className="flex-1 sm:flex-none"
                                        onPress={() => respond({taskId: t.id, accept: false})}>Decline</Button>
                            </div>
                        </div>)
                    }

                    // Standard Task Card
                    return (<div key={t.id}
                                 className={`group flex items-center gap-4 p-3 rounded-xl border transition-all hover:shadow-md ${t.isCompleted ? 'bg-default-50 border-default-100' : 'bg-background border-default-200'}`}>
                            <Checkbox
                                isSelected={t.isCompleted}
                                onChange={() => handleToggle(t.id, t.isCompleted)}
                                className="ml-1"
                            >
                                <CheckboxControl>
                                    <CheckboxIndicator/>
                                </CheckboxControl>
                            </Checkbox>

                            <div
                                className="flex-1 cursor-pointer min-w-0"
                                onClick={() => setSelectedTask(t)}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <span
                                        className={`font-medium truncate ${t.isCompleted ? "line-through text-default-400" : "text-foreground"}`}>
                                        {t.title}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {t.priority !== 'low' && !t.isCompleted && (<Chip size="sm" variant="soft"
                                                                                          color={t.priority === 'critical' ? 'danger' : t.priority === 'high' ? 'warning' : 'default'}>
                                                {t.priority}
                                            </Chip>)}
                                        {t.category && (<span
                                                className="text-[10px] uppercase tracking-wider font-bold text-default-400 border border-default-200 px-1.5 py-0.5 rounded">
                                                {t.category}
                                            </span>)}
                                    </div>
                                </div>

                                {(t.subtasks.length > 0 || t.description) && (
                                    <div className="flex items-center gap-3 mt-1">
                                        {t.subtasks.length > 0 && (<span
                                                className={`text-xs flex items-center gap-1 ${t.subtasks.every(s => s.isComplete) ? 'text-success' : 'text-default-400'}`}>
                                                <Icon icon="gravity-ui:list-ul"/>
                                                {t.subtasks.filter(s => s.isComplete).length}/{t.subtasks.length}
                                            </span>)}
                                        {t.description && (
                                            <span className="text-xs text-default-400 truncate max-w-[200px]">
                                                {t.description}
                                            </span>)}
                                    </div>)}
                            </div>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onPress={() => setSelectedTask(t)}
                            >
                                <Icon icon="gravity-ui:chevron-right"/>
                            </Button>
                        </div>);
                }))}
        </div>

        {selectedTask && (<TaskDetailModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
        />)}
    </Surface>);
}
