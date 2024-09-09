import React, { useState, useCallback } from 'react';
import { FaChevronRight, FaChevronDown, FaTrash, FaPlus } from 'react-icons/fa';
import type { Task } from '@extension/storage';
import { PriorityDropdown, Priority } from './TasksToolbar';

interface TaskItemProps {
  task: Task;
  level: number;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  allTasksCollapsed: boolean;
  isRoot?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level, onUpdate, onDelete, allTasksCollapsed, isRoot = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!allTasksCollapsed);
  const [editedText, setEditedText] = useState(task.text);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskText, setNewSubTaskText] = useState('');

  const handleToggleCompleted = useCallback(() => {
    onUpdate({ ...task, completed: !task.completed });
  }, [task, onUpdate]);

  const handleUpdatePriority = useCallback(
    (priority: Priority) => {
      onUpdate({ ...task, priority });
    },
    [task, onUpdate],
  );

  const handleEditTask = useCallback(() => {
    if (editedText.trim() !== '') {
      onUpdate({ ...task, text: editedText.trim() });
      setIsEditing(false);
    }
  }, [editedText, task, onUpdate]);

  const handleAddSubTask = useCallback(() => {
    if (newSubTaskText.trim() !== '') {
      const newSubTask: Task = {
        id: Date.now().toString(),
        text: newSubTaskText.trim(),
        completed: false,
        priority: 'medium',
        children: [],
      };
      onUpdate({
        ...task,
        children: [...task.children, newSubTask],
      });
      setNewSubTaskText('');
      setIsAddingSubTask(false);
      setIsExpanded(true);
    }
  }, [newSubTaskText, task, onUpdate]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <li className="">
      <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center flex-grow min-w-0" style={{ marginLeft: `${level * 16}px` }}>
          {task.children.length > 0 && (
            <button
              onClick={handleToggleExpanded}
              className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0">
              {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
            </button>
          )}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleCompleted}
            className="form-checkbox h-4 w-4 text-blue-600 mr-2 rounded flex-shrink-0"
          />
          {isEditing ? (
            <input
              type="text"
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              onBlur={handleEditTask}
              onKeyPress={e => e.key === 'Enter' && handleEditTask()}
              className="flex-grow min-w-0 p-1 border rounded text-sm"
              autoFocus
            />
          ) : (
            <span
              className={`cursor-pointer text-sm truncate ${task.completed ? 'line-through text-gray-500' : ''}`}
              onClick={() => setIsEditing(true)}>
              {task.text}
            </span>
          )}
        </div>
        <div className="flex items-center flex-shrink-0 ml-2 space-x-1">
          <PriorityDropdown currentPriority={task.priority} onChange={handleUpdatePriority} />
          {isRoot && (
            <button
              onClick={() => setIsAddingSubTask(true)}
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
              title="Add Subtask">
              <FaPlus size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 transition-colors duration-200">
            <FaTrash size={14} />
          </button>
        </div>
      </div>
      {isExpanded && task.children.length > 0 && (
        <ul className="mt-2 ml-4">
          {task.children.map(childTask => (
            <TaskItem
              key={childTask.id}
              task={childTask}
              level={level + 1}
              onUpdate={updatedChildTask => {
                onUpdate({
                  ...task,
                  children: task.children.map(t => (t.id === updatedChildTask.id ? updatedChildTask : t)),
                });
              }}
              onDelete={childTaskId => {
                onUpdate({
                  ...task,
                  children: task.children.filter(t => t.id !== childTaskId),
                });
              }}
              allTasksCollapsed={allTasksCollapsed}
              isRoot={false}
            />
          ))}
        </ul>
      )}
      {isAddingSubTask && (
        <div className="mt-1 bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm">
          <div className="flex items-center">
            <input
              type="text"
              value={newSubTaskText}
              onChange={e => setNewSubTaskText(e.target.value)}
              placeholder="New subtask"
              className="flex-grow min-w-0 p-1 text-sm border rounded mr-2"
            />
            <button
              onClick={handleAddSubTask}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 whitespace-nowrap">
              Add
            </button>
            <button
              onClick={() => setIsAddingSubTask(false)}
              className="ml-2 px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200 whitespace-nowrap">
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default TaskItem;
