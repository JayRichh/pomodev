import React, { useState, useCallback } from 'react';
import { FaChevronRight, FaChevronDown, FaTrash, FaPlus } from 'react-icons/fa';
import type { Task } from '@extension/storage';
import { PriorityDropdown, Priority } from './TasksToolbar';
import { useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

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

  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  // Toggle completed state
  const handleToggleCompleted = useCallback(() => {
    onUpdate({ ...task, completed: !task.completed });
  }, [task, onUpdate]);

  // Update task priority
  const handleUpdatePriority = useCallback(
    (priority: Priority) => {
      onUpdate({ ...task, priority });
    },
    [task, onUpdate],
  );

  // Save edited text for task
  const handleEditTask = useCallback(() => {
    if (editedText.trim() !== '') {
      onUpdate({ ...task, text: editedText.trim() });
      setIsEditing(false); // Stop editing after update
    }
  }, [editedText, task, onUpdate]);

  // Handle editing sub-task text
  const handleSubTaskEdit = useCallback(
    (updatedSubTask: Task) => {
      onUpdate({
        ...task,
        children: task.children.map(t => (t.id === updatedSubTask.id ? updatedSubTask : t)),
      });
    },
    [task, onUpdate],
  );

  // Add sub-task
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

  // Toggle expanded state
  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  return (
    <li>
      <div
        className={`flex items-center ${isLight ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'} p-2 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-center flex-grow min-w-0" style={{ marginLeft: `${level * 16}px` }}>
          {task.children.length > 0 && (
            <button
              onClick={handleToggleExpanded}
              className={`mr-2 ${isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'} flex-shrink-0`}>
              {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
            </button>
          )}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleCompleted}
            className={`form-checkbox h-4 w-4 ${isLight ? 'text-blue-600' : 'text-blue-400'} mr-2 rounded flex-shrink-0`}
          />
          {isEditing ? (
            <input
              type="text"
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              onBlur={handleEditTask}
              onKeyPress={e => e.key === 'Enter' && handleEditTask()}
              className={`flex-grow min-w-0 p-1 border ${isLight ? 'border-gray-300 text-gray-800 bg-white' : 'border-gray-600 text-white bg-gray-700'} rounded text-sm`}
              autoFocus
            />
          ) : (
            <span
              className={`cursor-pointer text-sm truncate ${task.completed ? `${isLight ? 'line-through text-gray-500' : 'line-through text-gray-400'}` : ''}`}
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
              className={`${isLight ? 'text-blue-500 hover:text-blue-600' : 'text-blue-400 hover:text-blue-500'} transition-colors duration-200`}
              title="Add Subtask">
              <FaPlus size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className={`${isLight ? 'text-red-500 hover:text-red-700' : 'text-red-400 hover:text-red-600'} transition-colors duration-200`}>
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
              onUpdate={handleSubTaskEdit}
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
        <div
          className={`mt-1 ${isLight ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'} p-2 rounded-md shadow-sm`}>
          <div className="flex items-center">
            <input
              type="text"
              value={newSubTaskText}
              onChange={e => setNewSubTaskText(e.target.value)}
              placeholder="New subtask"
              className={`flex-grow min-w-0 p-1 text-sm border ${isLight ? 'border-gray-300 bg-white text-gray-800' : 'border-gray-600 bg-gray-700 text-white'} rounded mr-2`}
            />
            <button
              onClick={handleAddSubTask}
              className={`px-2 py-1 text-sm ${isLight ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-400 text-white hover:bg-blue-500'} rounded transition-colors duration-200`}>
              Add
            </button>
            <button
              onClick={() => setIsAddingSubTask(false)}
              className={`ml-2 px-2 py-1 text-sm ${isLight ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' : 'bg-gray-600 text-white hover:bg-gray-500'} rounded transition-colors duration-200`}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default TaskItem;
