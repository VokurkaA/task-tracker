import {Button, Checkbox, Chip, InputGroup, Modal, Separator, Surface} from "@heroui/react";
import {useAddSubtask, useDeleteTask, useShareTask, useUpdateTask} from "../hooks/useTasks";
import {useMemo, useState} from "react";
import {Priority, type Task} from "../types";
import {toast} from "sonner";
import {Icon} from "@iconify/react";

interface TaskDetailModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

export default function TaskDetailModal({task, isOpen, onClose}: TaskDetailModalProps) {
    const {mutate: updateTask} = useUpdateTask();
    const {mutate: addSubtask, isPending: isAddingSubtask} = useAddSubtask();
    const {mutate: deleteTask, isPending: isDeleting} = useDeleteTask();
    const {mutate: shareTask, isPending: isSharing} = useShareTask();

    const [newSubtask, setNewSubtask] = useState("");
    const [shareEmail, setShareEmail] = useState("");

    const priorityColor = useMemo(() => {
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

    const handleShare = () => {
        if (!shareEmail.trim()) return;
        shareTask({taskId: task.id, email: shareEmail, role: 'EDITOR'}, {
            onSuccess: () => {
                toast.success(`Invite sent to ${shareEmail}`);
                setShareEmail("");
            }, onError: () => toast.error("Failed to send invite")
        });
    };

    const handleDelete = () => {
        deleteTask(task.id, {
            onSuccess: () => {
                toast.success("Task deleted");
                onClose();
            }, onError: () => toast.error("Failed to delete task")
        });
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        addSubtask({taskId: task.id, title: newSubtask.trim()}, {
            onSuccess: () => setNewSubtask(""), onError: () => toast.error("Failed to add subtask")
        });
    };

    return (<Modal isOpen={isOpen} onOpenChange={onClose}>
        <Modal.Container>
            <Modal.Dialog className="sm:max-w-xl">
                <Modal.CloseTrigger/>
                <Modal.Header className="flex flex-col gap-3">
                    <div className="flex items-center justify-between pr-8">
                        <Modal.Heading className="text-xl font-bold truncate">
                            {task.title}
                        </Modal.Heading>
                    </div>
                    <div className="flex gap-2">
                        <Chip variant="soft" color={priorityColor} size="sm" className="capitalize">
                            {task.priority} Priority
                        </Chip>
                        {task.category && (<Chip variant="soft" color="default" size="sm">
                            {task.category}
                        </Chip>)}
                    </div>
                </Modal.Header>

                <Modal.Body className="space-y-6">
                    {task.description && (<Surface className="p-4 rounded-lg bg-default-50 text-sm text-default-600">
                        {task.description}
                    </Surface>)}

                    {/* Subtasks Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-default-500">
                            <Icon icon="gravity-ui:list-check"/>
                            <span>Subtasks</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {task.subtasks.map((st) => (<div
                                key={st.id}
                                className="group flex items-center gap-3 p-2 hover:bg-default-100 rounded-md transition-colors"
                            >
                                <Checkbox
                                    isSelected={st.isComplete}
                                    onChange={() => handleSubtaskToggle(st.id, !st.isComplete)}
                                >
                                    <Checkbox.Control>
                                        <Checkbox.Indicator/>
                                    </Checkbox.Control>
                                </Checkbox>
                                <span
                                    className={`text-sm flex-1 ${st.isComplete ? "line-through text-default-400" : ""}`}>
                                            {st.title}
                                        </span>
                            </div>))}
                        </div>

                        <InputGroup>
                            <InputGroup.Input
                                placeholder="Add new subtask..."
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                            />
                            <InputGroup.Suffix>
                                <Button variant="secondary" onPress={handleAddSubtask} isDisabled={isAddingSubtask}
                                        size="sm">
                                    Add
                                </Button>
                            </InputGroup.Suffix>
                        </InputGroup>
                    </div>

                    <Separator/>

                    {/* Collaborators Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-default-500">
                            <Icon icon="gravity-ui:persons"/>
                            <span>Collaborators</span>
                        </div>

                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:envelope" className="text-default-400"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                placeholder="Invite via email..."
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                            />
                            <InputGroup.Suffix>
                                <Button variant="primary" onPress={handleShare} isPending={isSharing}
                                        isDisabled={isSharing} size="sm">
                                    Invite
                                </Button>
                            </InputGroup.Suffix>
                        </InputGroup>

                        {task.sharedWith && task.sharedWith.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">
                            {task.sharedWith.map((user, idx) => (<Chip key={idx} variant="soft" size="sm">
                                <Icon icon="gravity-ui:person" className="mr-1"/>
                                User {user.userId.slice(0, 4)} ({user.status})
                            </Chip>))}
                        </div>)}
                    </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-between gap-4">
                    <Button variant="danger" onPress={handleDelete} isPending={isDeleting}>
                        Delete Task
                    </Button>
                    <Button
                        className="w-full sm:w-auto"
                        variant={task.isCompleted ? "tertiary" : "primary"}
                        onPress={() => updateTask({
                            id: task.id, updates: {isCompleted: !task.isCompleted}
                        }, {onSuccess: onClose})}
                    >
                        {task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal>);
}