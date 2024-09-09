import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useStorageSuspense } from '@extension/shared';
import { pomodoroStorage, exampleThemeStorage, Task } from '@extension/storage';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaEdit } from 'react-icons/fa';
import '@src/Popup.css';
import { createPortal } from 'react-dom';
import { SearchBar, SortAndFilterMenu, filterAndSortTasks, Priority, SortBy } from './TasksToolbar';

const priorityColors = {
  low: 'bg-green-200 dark:bg-green-800',
  medium: 'bg-yellow-200 dark:bg-yellow-800',
  high: 'bg-red-200 dark:bg-red-800',
};

const useOutsideClick = (ref: React.RefObject<HTMLElement>, onClickOutside: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onClickOutside]);
};

const PriorityDropdown: React.FC<{
  currentPriority: Priority;
  onChange: (priority: Priority) => void;
}> = ({ currentPriority, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const theme = useStorageSuspense(exampleThemeStorage);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  const handleDropdownPosition = (clickY: number) => {
    const windowHeight = window.innerHeight;
    const dropdownHeight = 150; // Estimated dropdown height
    const buffer = 20; // Buffer from the bottom of the screen

    // Check if there's enough space below, otherwise open upwards
    if (clickY + dropdownHeight + buffer > windowHeight) {
      setDropdownStyle({
        top: 'auto',
        bottom: windowHeight - clickY + 'px',
      });
    } else {
      setDropdownStyle({
        top: clickY + 'px',
        bottom: 'auto',
      });
    }
  };

  const handleOpenDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    const clickY = event.clientY;
    setIsOpen(true);
    handleDropdownPosition(clickY);
  };

  return (
    <>
      <button
        ref={buttonRef}
        className="flex items-center p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={e => handleOpenDropdown(e)}>
        <div className={`w-4 h-4 mr-1 rounded-full ${priorityColors[currentPriority]}`}></div>
        <span className="sr-only">Change priority</span>
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`fixed z-50 w-32 bg-white dark:bg-gray-700 border rounded shadow-lg ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}
            style={{
              position: 'absolute',
              left: buttonRef.current?.getBoundingClientRect().left,
              ...dropdownStyle,
            }}>
            {(['low', 'medium', 'high'] as Priority[]).map(priority => (
              <div
                key={priority}
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => {
                  onChange(priority);
                  setIsOpen(false);
                }}>
                <div className={`w-4 h-4 mr-2 rounded-full ${priorityColors[priority]}`}></div>
                <span className="text-gray-800 dark:text-white capitalize">{priority}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

const TaskItem: React.FC<{
  task: Task;
  index: number;
  level: number;
  toggleExpanded: (id: string) => void;
  isExpanded: boolean;
}> = ({ task, index, level, toggleExpanded, isExpanded }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = useCallback(() => {
    pomodoroStorage.toggleTask(task.id);
  }, [task.id]);

  const handleEdit = useCallback(() => {
    if (editText.trim() !== task.text) {
      pomodoroStorage.updateTask(task.id, editText.trim());
    }
    setIsEditing(false);
  }, [task.id, editText]);

  const handleDelete = useCallback(() => {
    pomodoroStorage.deleteTask(task.id);
  }, [task.id]);

  const handleAddChild = useCallback(() => {
    pomodoroStorage.addChildTask(task.id, 'New subtask');
  }, [task.id]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useOutsideClick(inputRef, () => {
    if (isEditing) {
      handleEdit();
    }
  });

  return (
    <li
      className={`relative ml-${level * 4} mb-1 rounded-lg bg-white dark:bg-gray-800`}
      style={{ overflow: 'visible', zIndex: 1 }}>
      <div className="flex items-center p-1 shadow-sm w-full">
        {task.children && task.children.length > 0 && (
          <button
            onClick={() => toggleExpanded(task.id)}
            className="mr-1 focus:outline-none text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        )}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className="mr-1 w-4 h-4 text-blue-600 rounded"
        />
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyPress={e => e.key === 'Enter' && handleEdit()}
            className="flex-grow p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span
            className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''} cursor-pointer`}
            onClick={() => setIsEditing(true)}>
            {task.text}
          </span>
        )}
        <div className="flex items-center space-x-1 relative">
          <PriorityDropdown
            currentPriority={task.priority}
            onChange={priority => pomodoroStorage.updateTaskPriority(task.id, priority)}
          />
          {level === 0 && (
            <button onClick={handleAddChild} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              <FaPlus className="text-sm hover:text-blue-600" />
            </button>
          )}
          <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            <FaEdit className="text-sm hover:text-yellow-500" />
          </button>
          <button onClick={handleDelete} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            <FaTrash className="text-sm hover:text-red-600" />
          </button>
        </div>
      </div>
      {isExpanded && task.children && task.children.length > 0 && (
        <ul className="pl-4">
          {task.children.map((childTask, childIndex) => (
            <TaskItem
              key={childTask.id}
              task={childTask}
              index={childIndex}
              level={level + 1}
              toggleExpanded={toggleExpanded}
              isExpanded={isExpanded}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const TasksTab: React.FC = () => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');

  const pomodoroState = useStorageSuspense(pomodoroStorage);
  const { tasks, hideCompleted, allTasksCollapsed } = pomodoroState;
  const theme = useStorageSuspense(exampleThemeStorage);

  const filteredAndSortedTasks = filterAndSortTasks(tasks, hideCompleted, filterPriority, searchText, sortBy);

  useEffect(() => {
    const collapsedState = tasks.reduce(
      (acc, task) => {
        acc[task.id] = allTasksCollapsed;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setExpandedTasks(collapsedState);
  }, [tasks, allTasksCollapsed]);

  const handleAddTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newTaskText.trim()) {
        pomodoroStorage.addTask(newTaskText.trim());
        setNewTaskText('');
        setNewTaskPriority('medium');
      }
    },
    [newTaskText, newTaskPriority],
  );

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <div
      className={`flex flex-col h-full rounded-lg shadow-lg w-full overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
      <div className="flex justify-between items-center w-full p-2 border-b border-gray-200 dark:border-gray-700 ">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => pomodoroStorage.toggleCollapseAll()}
            className={`p-2 rounded-full ${!allTasksCollapsed ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'} text-white transition-colors duration-200`}
            title={allTasksCollapsed ? 'Expand all tasks' : 'Collapse all tasks'}>
            {allTasksCollapsed ? <FaChevronRight size={12} /> : <FaChevronDown size={12} />}
          </button>
          <SearchBar searchText={searchText} setSearchText={setSearchText} />
          <SortAndFilterMenu
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            hideCompleted={hideCompleted}
            setHideCompleted={() => pomodoroStorage.toggleHideCompleted()}
          />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => pomodoroStorage.deleteAllTasks()}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
            title="Delete all tasks">
            <FaTrash size={12} />
          </button>
        </div>
      </div>

      <ul className="flex-grow overflow-y-auto w-full p-2 pb-10">
        {filteredAndSortedTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            level={0}
            toggleExpanded={toggleExpanded}
            isExpanded={expandedTasks[task.id]}
          />
        ))}
      </ul>

      <form
        onSubmit={handleAddTask}
        className={`flex w-full fixed bottom-0 z-50 left-0 right-0 ${theme === 'light' ? 'bg-white' : 'bg-gray-700'} border-t border-gray-200 dark:border-gray-600`}>
        <input
          type="text"
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          placeholder="Add a new task"
          className={`flex-grow p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'
          }`}
        />
        <select
          value={newTaskPriority}
          onChange={e => setNewTaskPriority(e.target.value as Priority)}
          className={`p-2 border-l border-r border-gray-300 dark:border-gray-600 ${
            theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'
          }`}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
          <FaPlus className="text-sm" />
        </button>
      </form>
    </div>
  );
};

export default TasksTab;
