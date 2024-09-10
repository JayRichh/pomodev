import React, { useState, useCallback } from 'react';
import { useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage, Task } from '@extension/storage';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import '@src/Popup.css';
import { SearchBar, SortAndFilterMenu, filterAndSortTasks, Priority, SortBy } from './TasksToolbar';
import TaskItem from './TaskItem';
import { usePomodoroStorage } from '@extension/shared';

const TasksTab: React.FC = () => {
  const {
    tasks,
    setTasks,
    hideCompleted,
    filterPriority,
    setFilterPriority,
    sortBy,
    setSortBy,
    searchText,
    setSearchText,
    addTask,
    deleteAllTasks,
    updateTaskTree,
    toggleHideCompleted,
  } = usePomodoroStorage();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [allTasksCollapsed, setAllTasksCollapsed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const theme = useStorageSuspense(exampleThemeStorage);

  const filteredAndSortedTasks = filterAndSortTasks(tasks, hideCompleted, filterPriority, searchText, sortBy);

  const handleAddTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newTaskText.trim()) {
        addTask(newTaskText.trim(), newTaskPriority).then(() => {
          setNewTaskText('');
          setNewTaskPriority('medium');
        });
      }
    },
    [newTaskText, newTaskPriority, addTask],
  );

  const handleTaskUpdate = useCallback(
    (updatedTask: Task) => {
      updateTaskTree(tasks => tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
    },
    [updateTaskTree],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      updateTaskTree(tasks => tasks.filter(task => task.id !== taskId));
    },
    [updateTaskTree],
  );

  const handleDeleteAllTasks = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteAllTasks = useCallback(() => {
    deleteAllTasks();
    setShowDeleteConfirm(false);
  }, [deleteAllTasks]);

  return (
    <div className={`flex flex-col h-full rounded-lg shadow-lg w-full overflow-hidden bg-background text-foreground`}>
      <div className={`flex justify-between items-center w-full p-2 border-b border-border`}>
        <div className="flex items-center space-x-1">
          <SearchBar searchText={searchText} setSearchText={setSearchText} />
          <SortAndFilterMenu
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            hideCompleted={hideCompleted}
            toggleHideCompleted={toggleHideCompleted}
          />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleDeleteAllTasks}
            className="p-2 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors duration-200"
            title="Delete all tasks">
            <FaTrash size={12} />
          </button>
        </div>
      </div>

      <ul
        className={`flex-grow overflow-y-auto w-full p-2 pb-10 ${theme === 'light' ? 'scrollbar-light' : 'scrollbar-dark'}`}>
        {filteredAndSortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            level={0}
            onUpdate={handleTaskUpdate}
            onDelete={handleDeleteTask}
            allTasksCollapsed={allTasksCollapsed}
          />
        ))}
      </ul>

      <form
        onSubmit={handleAddTask}
        className={`flex w-full fixed bottom-0 z-50 left-0 right-0 ${theme === 'light' ? 'bg-white' : 'bg-gray-700'} border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}>
        <input
          type="text"
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          placeholder="Add a new task"
          className={`flex-grow p-2 focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-500 bg-white text-gray-800' : 'focus:ring-blue-500 bg-gray-700 text-white'}`}
        />
        <select
          value={newTaskPriority}
          onChange={e => setNewTaskPriority(e.target.value as Priority)}
          className={`p-2 border-l border-r ${theme === 'light' ? 'border-gray-300 bg-white text-gray-800' : 'border-gray-600 bg-gray-700 text-white'}`}>
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-4 rounded-lg shadow-lg max-w-sm w-full ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'}`}>
            <h3 className="text-lg font-semibold mb-2">Confirm Delete All Tasks</h3>
            <p className="mb-4">Are you sure you want to delete all tasks? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${theme === 'light' ? 'bg-gray-300 text-gray-800 hover:bg-gray-400' : 'bg-gray-600 text-white hover:bg-gray-500'}`}>
                Cancel
              </button>
              <button
                onClick={confirmDeleteAllTasks}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TasksTab;
