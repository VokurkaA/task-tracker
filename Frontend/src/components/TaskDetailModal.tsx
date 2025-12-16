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
    ModalHeader,
} from "@heroui/react";
import {useAddSubtask, useUpdateTask} from "../hooks/useTasks";
import {useMemo, useState} from "react";
import {Priority, type Task} from "../types.ts";

interface TaskDetailModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

export default function TaskDetailModal({task, isOpen, onClose}: TaskDetailModalProps) {
    const {mutate: updateTask} = useUpdateTask();
    const {mutate: addSubtask} = useAddSubtask();
    const [newSubtask, setNewSubtask] = useState("");

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
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        addSubtask({taskId: task.id, title: newSubtask.trim()});
        setNewSubtask("");
    };

    return (<Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContainer className="w-md select-none">
            <ModalDialog>
                <ModalCloseTrigger/>
                <ModalHeader>
                    <h2>{task.title}</h2>
                    <div className="flex justify-between">
                        <Chip variant="secondary">{task.category}</Chip>
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
                </ModalBody>
            </ModalDialog>
        </ModalContainer>
    </Modal>);
}