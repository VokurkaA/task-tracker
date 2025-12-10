import { useState } from 'react';
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem, useDisclosure, Input, Select, SelectItem } from "@heroui/react";
import { AuthForm } from './components/AuthForm';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { useTasks, Task } from './hooks/useTasks';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | undefined>(undefined); // Need to store user ID for socket
  
  // View State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Form State for New Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  const { query, createTask, updateTask, addSubtask, toggleSubtask, shareTask } = useTasks(userId);

  const handleLogin = (newToken: string, uid: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUserId(uid);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId(undefined);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };

  if (!token) {
    return <AuthForm onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navbar */}
      <Navbar className="bg-white rounded-xl shadow-sm mb-6">
        <NavbarBrand>
          <p className="font-bold text-inherit">TASK TRACKER</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button color="danger" variant="flat" onPress={handleLogout}>
              Logout
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        
        {/* Create Task Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4 items-end">
           <Input 
             label="New Task" 
             placeholder="What needs to be done?" 
             className="flex-grow" 
             value={newTaskTitle}
             onValueChange={setNewTaskTitle}
           />
           <Select 
             label="Priority" 
             className="w-40" 
             defaultSelectedKeys={['medium']}
             onChange={(e) => setNewTaskPriority(e.target.value)}
           >
             <SelectItem key="low">Low</SelectItem>
             <SelectItem key="medium">Medium</SelectItem>
             <SelectItem key="high">High</SelectItem>
           </Select>
           <Button color="primary" onPress={() => {
              createTask.mutate({ title: newTaskTitle, priority: newTaskPriority });
              setNewTaskTitle('');
           }}>
             Add
           </Button>
        </div>

        {/* Task Grid */}
        {query.isLoading ? (
           <p>Loading tasks...</p>
        ) : (
           <TaskList tasks={query.data || []} onTaskClick={handleTaskClick} />
        )}
      </div>

      {/* Detail Modal */}
      <TaskModal 
        isOpen={isOpen} 
        onClose={onClose} 
        task={selectedTask}
        onUpdate={(id, data) => updateTask.mutate({ id, data })}
        onAddSubtask={(taskId, title) => addSubtask.mutate({ taskId, title })}
        onToggleSubtask={(taskId, subtasks) => toggleSubtask.mutate({ taskId, subtasks })}
        onShare={(taskId, email, role) => shareTask.mutate({ taskId, email, role })}
      />
    </div>
  );
}

export default App;