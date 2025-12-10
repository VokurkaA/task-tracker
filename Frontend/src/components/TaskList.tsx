import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react";
import type { Task } from "../hooks/useTasks";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskList = ({ tasks, onTaskClick }: TaskListProps) => {
  if (tasks.length === 0) {
    return <div className="text-center text-gray-500 mt-10">No tasks found. Create one!</div>;
  }

  const priorityColor = {
    low: "success",
    medium: "warning",
    high: "danger",
    critical: "danger"
  } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.id} isPressable onPress={() => onTaskClick(task)} className="hover:scale-[1.02] transition-transform">
          <CardHeader className="flex justify-between">
            <h4 className="font-bold text-large">{task.title}</h4>
            <Chip size="sm" color={priorityColor[task.priority] || "default"} variant="dot">
              {task.priority}
            </Chip>
          </CardHeader>
          <CardBody className="px-3 py-0 text-small text-default-500">
            <p>{task.description || "No description provided."}</p>
            <div className="mt-4 flex gap-2">
               {/* Progress bar simulation */}
               <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                  <div className="bg-blue-600 h-2.5 rounded-full" 
                       style={{ width: `${task.subtasks.length > 0 
                         ? (task.subtasks.filter(t => t.isComplete).length / task.subtasks.length) * 100 
                         : 0}%` }}>
                  </div>
               </div>
               <span className="text-xs">
                 {task.subtasks.filter(t => t.isComplete).length}/{task.subtasks.length}
               </span>
            </div>
          </CardBody>
          <CardFooter className="gap-2">
             {task.status === 'completed' && <Chip color="success" size="sm">Done</Chip>}
             {task.sharedWith.length > 0 && <Chip color="secondary" size="sm">Shared</Chip>}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};