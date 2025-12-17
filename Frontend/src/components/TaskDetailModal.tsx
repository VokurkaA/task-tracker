"use client";

import {
    Button,
    Checkbox,
    CheckboxContent,
    CheckboxControl,
    CheckboxIndicator,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalCloseTrigger,
    ModalContainer,
    ModalDialog,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import {useAddSubtask, useDeleteTask, useShareTask, useUpdateTask} from "../hooks/useTasks";
import {useMemo, useState} from "react";
import {Priority, type Task} from "../types.ts";
import {toast} from "sonner"; 

interface TaskDetailModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

export default function TaskDetailModal({task, isOpen, onClose}: TaskDetailModalProps) {
    const {mutate: updateTask} = useUpdateTask();
    const {mutate: addSubtask} = useAddSubtask();
    const {mutate: deleteTask} = useDeleteTask();
    const {mutate: shareTask, isPending: isSharing} = useShareTask();

    const [newSubtask, setNewSubtask] = useState("");
    const [shareEmail, setShareEmail] = useState("");

    const priorityChipColor = useMemo(() => {
        switch (task.priority) {
            case Priority.LOW:
                return "success";
            case Priority.MEDIUM:
                return "accent";
            case Priority.HIGH:
                return "warning";
            case Priority.CRITICAL:
                return "danger";
            default:
                return "default";
        }
    }, [task.priority]);

    const handleSubtaskToggle = (subtaskId: string, isComplete: boolean) => {
        const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? {...st, isComplete} : st);
        updateTask({id: task.id, updates: {subtasks: updatedSubtasks}});
        // No toast here to keep UI snappy and less noisy
    };

    const handleShare = () => {
        if (!shareEmail.trim()) return;
        shareTask({taskId: task.id, email: shareEmail, role: 'EDITOR'}, {
            onSuccess: () => {
                toast.success(`Invite sent to ${shareEmail}`);
                setShareEmail("");
            }, onError: () => {
                toast.error("Failed to send invite");
            }
        });
    };

    const handleDelete = () => {
        deleteTask(task.id, {
            onSuccess: () => {
                toast.success("Task deleted");
                onClose();
            }, onError: () => {
                toast.error("Failed to delete task");
            }
        });
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        addSubtask({taskId: task.id, title: newSubtask.trim()}, {
            onSuccess: () => {
                toast.success("Subtask added");
                setNewSubtask("");
            }, onError: () => {
                toast.error("Failed to add subtask");
            }
        });
    };

    const handleToggleComplete = () => {
        const newStatus = !task.isCompleted;
        updateTask({id: task.id, updates: {isCompleted: newStatus}}, {
            onSuccess: () => {
                toast.success(newStatus ? "Task completed!" : "Task marked as active");
                if (newStatus) onClose(); // Optional: close modal on completion
            }
        });
    };

    return (<Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContainer className="w-md select-none">
            <ModalDialog>
                <ModalCloseTrigger/>
                <ModalHeader>
                    <h2>{task.title}</h2>
                    <div className="flex justify-between">
                        {task.category && <Chip variant="secondary">{task.category}</Chip>}
                        <Chip variant="primary" color={priorityChipColor}>{task.priority}</Chip>
                    </div>
                </ModalHeader>
                <ModalBody className="space-y-6">
                    {task.description && (<div>{task.description}</div>)}

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase text-default-400">Subtasks</h3>

                        <div className="space-y-2">
                            {task.subtasks.map((st) => (<div key={st.id} className="flex items-center gap-3">
                                <Checkbox
                                    isSelected={st.isComplete}
                                    onChange={() => handleSubtaskToggle(st.id, !st.isComplete)}
                                >
                                    <CheckboxControl>
                                        <CheckboxIndicator/>
                                    </CheckboxControl>
                                    <CheckboxContent>
                                                <span className={st.isComplete ? "line-through text-default-400" : ""}>
                                                    {st.title}
                                                </span>
                                    </CheckboxContent>
                                </Checkbox>
                            </div>))}
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Input
                                className="flex-1"
                                placeholder="Add new subtask..."
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                            />
                            <Button variant="secondary" onPress={handleAddSubtask}>Add</Button>
                        </div>
                    </div>
                    <div className="space-y-2 border-t pt-4">
                        <h3 className="text-sm font-semibold uppercase text-default-400">Share Task</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="user@example.com"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                            />
                            <Button
                                variant="secondary"
                                onPress={handleShare}
                                isDisabled={isSharing}
                            >
                                {isSharing ? "Sending..." : "Invite"}
                            </Button>
                        </div>

                        {task.sharedWith && task.sharedWith.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">
                            {task.sharedWith.map((user, idx) => (<Chip key={idx} variant="soft" size="sm">
                                User {user.userId.slice(0, 5)}... ({user.status})
                            </Chip>))}
                        </div>)}
                    </div>
                </ModalBody>
                <ModalFooter className="flex justify-between">
                    <Button variant="danger" onPress={handleDelete}>Delete</Button>
                    <Button
                        variant={task.isCompleted ? "secondary" : "primary"}
                        onPress={handleToggleComplete}
                    >
                        {task.isCompleted ? "Mark incomplete" : "Mark complete"}
                    </Button>
                </ModalFooter>
            </ModalDialog>
        </ModalContainer>
    </Modal>);
}