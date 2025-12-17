import {
    Button,
    Checkbox,
    Chip,
    CloseButton,
    InputGroup, Label,
    ListBox,
    Modal,
    Select,
    Separator,
    Surface
} from "@heroui/react";
import {
    useAddSubtask,
    useDeleteTask,
    useRespondToInvite,
    useRevokeAccess,
    useShareTask,
    useUpdateShareRole,
    useUpdateTask
} from "../hooks/useTasks";
import {useAuth} from "../hooks/useAuth";
import {useMemo, useState} from "react";
import {Priority, Role, ShareStatus, type Task} from "../types";
import {toast} from "sonner";
import {Icon} from "@iconify/react";

interface TaskDetailModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

export default function TaskDetailModal({task, isOpen, onClose}: TaskDetailModalProps) {
    const {user: currentUser} = useAuth();
    const {mutate: updateTask} = useUpdateTask();
    const {mutate: addSubtask, isPending: isAddingSubtask} = useAddSubtask();
    const {mutate: deleteTask, isPending: isDeleting} = useDeleteTask();
    const {mutate: shareTask, isPending: isSharing} = useShareTask();
    const {mutate: respondToInvite} = useRespondToInvite();

    // Initialize hooks for managing access
    const {mutate: updateShareRole} = useUpdateShareRole();
    const {mutate: revokeAccess} = useRevokeAccess();

    const [newSubtask, setNewSubtask] = useState("");
    const [shareEmail, setShareEmail] = useState("");

    const isOwner = currentUser?.id === task.ownerId;

    const pendingInvite = useMemo(() => {
        return task.sharedWith.find(u => u.userId === currentUser?.id && u.status === ShareStatus.PENDING);
    }, [task.sharedWith, currentUser]);

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
        shareTask({taskId: task.id, email: shareEmail, role: 'editor'}, {
            onSuccess: () => {
                toast.success(`Invite sent to ${shareEmail}`);
                setShareEmail("");
            }, onError: (err: any) => toast.error(err?.response?.data?.error || "Failed to send invite")
        });
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        updateShareRole({taskId: task.id, userId, role: newRole}, {
            onSuccess: () => toast.success("Role updated"), onError: () => toast.error("Failed to update role")
        });
    };

    const handleRevoke = (userId: string) => {
        if (!confirm("Are you sure you want to remove this user?")) return;
        revokeAccess({taskId: task.id, userId}, {
            onSuccess: () => toast.success("Access revoked"), onError: () => toast.error("Failed to revoke access")
        });
    };

    const handleInviteResponse = (accept: boolean) => {
        respondToInvite({taskId: task.id, accept}, {
            onSuccess: () => {
                toast.success(accept ? "Invite accepted" : "Invite declined");
                if (!accept) onClose();
            }, onError: () => toast.error("Failed to respond to invite")
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
        <Modal.Container className="min-w-md">
            <Modal.Dialog className="sm:max-w-xl">
                <Modal.Header className="flex flex-col gap-3 relative">
                    <CloseButton onPress={onClose} className="absolute right-6 top-6"/>

                    <div className="flex items-center justify-between">
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

                    {pendingInvite && (<div
                        className="flex items-center justify-between p-3 bg-warning-50 text-warning-900 rounded-lg border border-warning-200 mt-2">
                        <span className="text-sm font-medium">You have been invited to edit this task.</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary"
                                    onPress={() => handleInviteResponse(true)}>Accept</Button>
                            <Button size="sm" variant="danger"
                                    onPress={() => handleInviteResponse(false)}>Decline</Button>
                        </div>
                    </div>)}
                </Modal.Header>

                <Modal.Body className="space-y-6 flex flex-col">
                    {task.description && (<Surface className="p-4 rounded-lg bg-default-50 text-sm text-default-600">
                        {task.description}
                    </Surface>)}

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
                                    aria-label={`Mark subtask ${st.title} as ${st.isComplete ? 'incomplete' : 'complete'}`}
                                    isSelected={st.isComplete}
                                    onChange={(isSelected) => handleSubtaskToggle(st.id, isSelected)}
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

                        <InputGroup className="flex flex-1">
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

                    <div className="space-y-3 flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-semibold text-default-500">
                            <Icon icon="gravity-ui:persons"/>
                            <Label>Collaborators</Label>
                        </div>

                        {isOwner && (<InputGroup className="fles flex-1">
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:envelope" className="text-default-400"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                placeholder="Invite via email..."
                                type="email"
                                autoComplete="email"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                            />
                            <InputGroup.Suffix className="p-0">
                                <Button variant="primary" onPress={handleShare} isPending={isSharing}
                                        isDisabled={isSharing} size="sm">
                                    Invite
                                </Button>
                            </InputGroup.Suffix>
                        </InputGroup>)}

                        {task.sharedWith && task.sharedWith.length > 0 ? (<div className="flex flex-col gap-2 mt-2">
                            {task.sharedWith.map((user) => (<div key={user.userId}
                                                                 className="flex items-center justify-between p-2 rounded-lg border border-default-200 bg-default-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-sm font-medium">{user.username || user.email}</span>
                                            {user.status === ShareStatus.PENDING && (
                                                <Chip size="sm" color="warning" variant="tertiary">Pending</Chip>)}
                                        </div>
                                        <span className="text-xs text-default-400">{user.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isOwner ? (<>
                                        <Select
                                            aria-label="Change role"
                                            className="w-24"
                                            value={user.role}
                                            onChange={(key) => handleRoleChange(user.userId, key as string)}
                                        >
                                            <Select.Trigger className="h-8 min-h-0 px-2 text-xs">
                                                <Select.Value/>
                                                <Select.Indicator />
                                            </Select.Trigger>
                                            <Select.Popover>
                                                <ListBox>
                                                    <ListBox.Item id={Role.EDITOR}
                                                                  textValue="Editor">Editor</ListBox.Item>
                                                    <ListBox.Item id={Role.VIEWER}
                                                                  textValue="Viewer">Viewer</ListBox.Item>
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onPress={() => handleRevoke(user.userId)}
                                        >
                                            <Icon icon="gravity-ui:trash-bin"/>
                                        </Button>
                                    </>) : (<Chip size="sm" variant="soft"
                                                  className="capitalize">{user.role}</Chip>)}
                                </div>
                            </div>))}
                        </div>) : (<div className="text-sm text-default-400 italic">No collaborators yet.</div>)}
                    </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-between gap-4">
                    {isOwner ? (<Button variant="danger" onPress={handleDelete} isPending={isDeleting}>
                        Delete Task
                    </Button>) : (<div></div>)}

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