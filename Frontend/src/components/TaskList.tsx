"use client";

import {useMemo, useState} from "react";
import {Alert, Button, Checkbox, Chip, ComboBox, Input, ListBox, Tabs} from "@heroui/react";
import {useRespondToInvite, useTasks, useUpdateTask} from "../hooks/useTasks.ts";
import {useAuth} from "../hooks/useAuth.ts";
import NewTaskModal from "./NewTaskModal.tsx";
import TaskDetailModal from "./TaskDetailModal.tsx";
import {ShareStatus} from "../types.ts";
import {Icon} from "@iconify/react";

type FilterType = 'all' | 'active' | 'completed';

export default function TaskList() {
    const {data: tasks, isError, isLoading} = useTasks();
    const {mutate: updateTask} = useUpdateTask();
    const {mutate: respond} = useRespondToInvite();
    const {user} = useAuth();

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<FilterType>('all');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const selectedTask = useMemo(() => {
        return tasks?.find(t => t.id === selectedTaskId) || null;
    }, [tasks, selectedTaskId]);

    const categories = useMemo(() => {
        if (!tasks) return [];
        const unique = new Set(tasks.map(t => t.category).filter(Boolean));
        return Array.from(unique).map(c => ({id: c, name: c}));
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(t => {
            const myShare = t.sharedWith.find(u => u.userId === user?.id);
            if (myShare?.status === ShareStatus.PENDING) return true;

            if (statusFilter === 'active' && t.isCompleted) return false;
            if (statusFilter === 'completed' && !t.isCompleted) return false;

            return !(categoryFilter && categoryFilter !== "all" && t.category !== categoryFilter);
        });
    }, [tasks, statusFilter, categoryFilter, user?.id]);

    const activeCount = tasks?.filter(t => !t.isCompleted).length || 0;

    const handleToggle = (id: string, currentStatus: boolean) => {
        updateTask({id, updates: {isCompleted: !currentStatus}});
    };

    if (isLoading) {
        return (<div className="flex justify-center p-12">
            <Icon icon="gravity-ui:arrows-rotate-right" className="animate-spin text-3xl text-default-300"/>
        </div>);
    }

    return (<div className="w-full">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-2xl font-bold">My Tasks</h1>
                <p className="text-default-500">You have {activeCount} active tasks</p>
            </div>
            <NewTaskModal/>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <Tabs
                selectedKey={statusFilter}
                onSelectionChange={(key) => setStatusFilter(key as FilterType)}
            >
                <Tabs.ListContainer>
                    <Tabs.List>
                        <Tabs.Tab id="all">All <Tabs.Indicator/></Tabs.Tab>
                        <Tabs.Tab id="active">Active <Tabs.Indicator/></Tabs.Tab>
                        <Tabs.Tab id="completed">Completed <Tabs.Indicator/></Tabs.Tab>
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>

            <div className="w-full sm:w-64">
                <ComboBox
                    selectedKey={categoryFilter}
                    onSelectionChange={(key) => setCategoryFilter(key as string)}
                    allowsCustomValue={false}
                >
                    <ComboBox.InputGroup>
                        <Input placeholder="Filter by category"/>
                        <ComboBox.Trigger/>
                    </ComboBox.InputGroup>
                    <ComboBox.Popover>
                        <ListBox>
                            <ListBox.Item id="all">All Categories</ListBox.Item>
                            {categories.map((cat) => (<ListBox.Item id={cat.id} key={cat.id} textValue={cat.name}>
                                {cat.name}
                            </ListBox.Item>))}
                        </ListBox>
                    </ComboBox.Popover>
                </ComboBox>
            </div>
        </div>

        {isError && <Alert status="danger" className="mb-4">Failed to load tasks.</Alert>}

        <div className="flex flex-col gap-2">
            {filteredTasks.length === 0 ? (<div
                className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-default-500">
                <Icon icon="gravity-ui:list-ul" className="mb-2 text-3xl text-default-300"/>
                <p>No tasks found</p>
            </div>) : (filteredTasks.map((t) => {
                const myShare = t.sharedWith.find(u => u.userId === user?.id);
                const isPending = myShare?.status === ShareStatus.PENDING;

                if (isPending) {
                    return (<div key={t.id}
                                 className="flex items-center justify-between gap-4 rounded-md border border-warning-200 bg-warning-50 p-4">
                        <div className="flex items-center gap-3">
                            <Icon icon="gravity-ui:envelope" className="text-xl text-warning-500"/>
                            <div>
                                <p className="font-bold text-warning-900">Invitation: {t.title}</p>
                                <p className="text-xs text-warning-700">Shared by {t.ownerId}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onPress={() => respond({taskId: t.id, accept: true})}
                                    className="bg-warning-500 text-white">
                                Accept
                            </Button>
                            <Button size="sm" variant="tertiary"
                                    onPress={() => respond({taskId: t.id, accept: false})}>
                                Decline
                            </Button>
                        </div>
                    </div>);
                }

                return (<div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-md border p-3 ${t.isCompleted ? 'bg-default-50' : 'bg-background'}`}
                >
                    <Checkbox
                        isSelected={t.isCompleted}
                        onChange={() => handleToggle(t.id, t.isCompleted)}
                    >
                        <Checkbox.Control>
                            <Checkbox.Indicator/>
                        </Checkbox.Control>
                    </Checkbox>

                    <div
                        className="flex-1 cursor-pointer overflow-hidden"
                        onClick={() => setSelectedTaskId(t.id)}
                    >
                        <div className="flex items-center gap-2">
                                        <span
                                            className={`truncate font-medium ${t.isCompleted ? "text-default-400 line-through" : ""}`}>
                                            {t.title}
                                        </span>
                            <div className="flex shrink-0 gap-2">
                                {t.priority !== 'low' && !t.isCompleted && (<Chip
                                    size="sm"
                                    variant="soft"
                                    color={t.priority === 'critical' ? 'danger' : t.priority === 'high' ? 'warning' : 'default'}
                                >
                                    {t.priority}
                                </Chip>)}
                                {t.category && (<span
                                    className="rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-default-400">
                                                    {t.category}
                                                </span>)}
                            </div>
                        </div>

                        {(t.subtasks.length > 0 || t.description) && (
                            <div className="mt-1 flex items-center gap-3 text-xs text-default-400">
                                {t.subtasks.length > 0 && (<span
                                    className={`flex items-center gap-1 ${t.subtasks.every(s => s.isComplete) ? 'text-success' : ''}`}>
                                                    <Icon icon="gravity-ui:list-ul"/>
                                    {t.subtasks.filter(s => s.isComplete).length}/{t.subtasks.length}
                                                </span>)}
                                {t.description && (<span className="truncate max-w-[200px]">{t.description}</span>)}
                            </div>)}
                    </div>

                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="text-default-400"
                        onPress={() => setSelectedTaskId(t.id)}
                    >
                        <Icon icon="gravity-ui:chevron-right"/>
                    </Button>
                </div>);
            }))}
        </div>

        {selectedTask && (<TaskDetailModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTaskId(null)}
        />)}
    </div>);
}