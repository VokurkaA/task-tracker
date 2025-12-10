import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Checkbox, Chip, Divider, Avatar } from "@heroui/react";
import { Task, Subtask } from '../hooks/useTasks';
import { MdSend } from "react-icons/md";

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtasks: Subtask[]) => void;
  onShare: (taskId: string, email: string, role: string) => void;
}

export const TaskModal = ({ task, isOpen, onClose, onUpdate, onAddSubtask, onToggleSubtask, onShare }: TaskModalProps) => {
  const [subtaskInput, setSubtaskInput] = useState('');
  const [shareEmail, setShareEmail] = useState('');

  if (!task) return null;

  const handleSubtaskToggle = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, isComplete: !st.isComplete } : st
    );
    onToggleSubtask(task.id, updatedSubtasks);
  };

  const priorityColor = {
    low: "success",
    medium: "warning",
    high: "danger",
    critical: "danger"
  } as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-2xl">{task.title}</span>
            <Chip color={priorityColor[task.priority] || "default"} variant="flat">
              {task.priority.toUpperCase()}
            </Chip>
          </div>
          <p className="text-small text-default-500">ID: {task.id}</p>
        </ModalHeader>
        
        <ModalBody>
          {/* Status Section */}
          <div className="flex gap-4 mb-4">
             <Checkbox 
                isSelected={task.status === 'completed'} 
                onValueChange={(val) => onUpdate(task.id, { status: val ? 'completed' : 'pending' })}
             >
                Mark as Completed
             </Checkbox>
          </div>

          <Divider className="my-2" />

          {/* Subtasks Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Subtasks</h3>
            <div className="flex flex-col gap-2 mb-3">
              {task.subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2">
                  <Checkbox 
                    isSelected={st.isComplete} 
                    onValueChange={() => handleSubtaskToggle(st.id)}
                    lineThrough
                  >
                    {st.title}
                  </Checkbox>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                size="sm" 
                placeholder="New subtask..." 
                value={subtaskInput} 
                onValueChange={setSubtaskInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && subtaskInput) {
                    onAddSubtask(task.id, subtaskInput);
                    setSubtaskInput('');
                  }
                }}
              />
              <Button size="sm" isIconOnly onClick={() => {
                 if(subtaskInput) { onAddSubtask(task.id, subtaskInput); setSubtaskInput(''); }
              }}>
                +
              </Button>
            </div>
          </div>

          <Divider className="my-2" />

          {/* Sharing Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Collaborators</h3>
            <div className="flex gap-2 mb-3 flex-wrap">
              {task.sharedWith.length === 0 && <p className="text-small text-gray-400">Private task</p>}
              {task.sharedWith.map((user, idx) => (
                <Chip key={idx} variant="flat" avatar={<Avatar name={user.userId.slice(0,2)} />}>
                   {user.role}
                </Chip>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input 
                size="sm" 
                placeholder="colleague@school.edu" 
                startContent={<MdSend className="text-default-400"/>}
                value={shareEmail}
                onValueChange={setShareEmail}
              />
              <Button size="sm" color="primary" onClick={() => {
                if(shareEmail) { onShare(task.id, shareEmail, 'editor'); setShareEmail(''); }
              }}>
                Share
              </Button>
            </div>
          </div>

        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};