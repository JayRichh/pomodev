import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useStorageSuspense } from '@extension/shared';
import { pomodoroStorage, exampleThemeStorage, Task } from '@extension/storage';
import { FaPlus, FaTrash, FaFilter, FaChevronDown, FaChevronRight, FaEdit, FaGripVertical } from 'react-icons/fa';
import '@src/Popup.css';

const priorityColors = {
  low: 'bg-green-200 dark:bg-green-800',
  medium: 'bg-yellow-200 dark:bg-yellow-800',
  high: 'bg-red-200 dark:bg-red-800',
};

const useOutsideClick = (ref: React.RefObject<HTMLDivElement>, onClickOutside: () => void) => {
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
  currentPriority: Task['priority'];
  onChange: (priority: Task['priority']) => void;
}> = ({ currentPriority, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef} style={{ zIndex: 1000 }}>
      <button
        className="flex items-center p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}>
        <div className={`w-4 h-4 mr-1 rounded-full ${priorityColors[currentPriority]}`}></div>
      </button>
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border rounded shadow-lg"
          style={{ zIndex: 1000 }}>
          {['low', 'medium', 'high'].map(priority => (
            <div
              key={priority}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              onClick={() => {
                onChange(priority as Task['priority']);
                setIsOpen(false);
              }}>
              <div className={`w-4 h-4 mr-2 rounded-full ${priorityColors[priority as Task['priority']]}`}></div>
              <span className="text-gray-800 dark:text-white">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
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

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`ml-${level * 4} mb-1 rounded-lg ${
            snapshot.isDragging ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white dark:bg-gray-800'
          }`}
          style={{ overflow: 'visible' }}>
          <div className="flex items-center p-1 shadow-sm w-full relative z-10">
            {/* <div className="mr-1 cursor-move">
              <FaGripVertical className="text-gray-400" />
            </div> */}
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
            <div className="flex items-center space-x-1 relative z-50">
              <PriorityDropdown
                currentPriority={task.priority}
                onChange={priority => pomodoroStorage.updateTaskPriority(task.id, priority)}
              />
              <button onClick={handleAddChild} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <FaPlus className="text-sm hover:text-blue-600" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <FaEdit className="text-sm hover:text-yellow-500" />
              </button>
              <button onClick={handleDelete} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <FaTrash className="text-sm hover:text-red-600" />
              </button>
            </div>
          </div>
          {isExpanded && task.children && task.children.length > 0 && (
            <Droppable droppableId={`droppable-${task.id}`} type={`sub-task`}>
              {provided => (
                <ul ref={provided.innerRef} {...provided.droppableProps} className="pl-4">
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
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          )}
        </li>
      )}
    </Draggable>
  );
};

const TasksTab: React.FC = () => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({}); // Track expanded state

  const pomodoroState = useStorageSuspense(pomodoroStorage);
  const { tasks, hideCompleted, allTasksCollapsed } = pomodoroState;
  const theme = useStorageSuspense(exampleThemeStorage);

  const filteredTasks = tasks
    .filter(task => !hideCompleted || !task.completed)
    .filter(task => filterPriority === 'all' || task.priority === filterPriority)
    .filter(task => task.text.toLowerCase().includes(searchText.toLowerCase()));

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

  const updateNestedTasksOrder = (tasks: Task[], sourceId: string, destinationId: string): Task[] => {
    let sourceIndex: number | undefined;
    let destinationIndex: number | undefined;
    let sourceTaskParentId: string | undefined;
    let destinationTaskParentId: string | undefined;

    const findTaskIndexes = (tasks: Task[], parentId?: string): void => {
      tasks.forEach((task, index) => {
        if (task.id === sourceId) {
          sourceIndex = index;
          sourceTaskParentId = parentId;
        }
        if (task.id === destinationId) {
          destinationIndex = index;
          destinationTaskParentId = parentId;
        }
        if (task.children && task.children.length > 0) {
          findTaskIndexes(task.children, task.id);
        }
      });
    };

    findTaskIndexes(tasks);

    if (sourceIndex !== undefined && destinationIndex !== undefined) {
      if (sourceTaskParentId === destinationTaskParentId) {
        // If both tasks are within the same parent
        if (sourceTaskParentId === undefined) {
          // Top-level reorder
          const movedTask = tasks.splice(sourceIndex!, 1)[0];
          tasks.splice(destinationIndex!, 0, movedTask);
        } else {
          // Nested reorder
          const parentTask = tasks.find(task => task.id === sourceTaskParentId);
          const movedTask = parentTask!.children!.splice(sourceIndex!, 1)[0];
          parentTask!.children!.splice(destinationIndex!, 0, movedTask);
        }
      }
      // Update the storage
      pomodoroStorage.setTasks(tasks);
    }

    return tasks;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceId = result.draggableId;
    const destinationId = result.destination.droppableId.replace('droppable-', '');

    const updatedTasks = updateNestedTasksOrder([...tasks], sourceId, destinationId);

    // Update state
    pomodoroStorage.setTasks(updatedTasks);
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className={`flex flex-col h-full ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'} rounded-lg shadow-lg w-full`}>
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => pomodoroStorage.deleteAllTasks()}
              className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 group"
              title="Delete all tasks">
              <FaTrash className="text-sm group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              onClick={() => pomodoroStorage.toggleCollapseAll()}
              className={`p-1 rounded-full ${allTasksCollapsed ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'} text-white transition-colors duration-200 group`}
              title={allTasksCollapsed ? 'Expand all tasks' : 'Collapse all tasks'}>
              {allTasksCollapsed ? (
                <FaChevronRight className="text-sm group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <FaChevronDown className="text-sm group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value as Task['priority'] | 'all')}
              className={`p-1 border rounded ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'} focus:ring-2 focus:ring-blue-500`}
              title="Filter tasks by priority">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={() => pomodoroStorage.toggleHideCompleted()}
              className={`p-1 rounded-full ${hideCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white transition-colors duration-200 group`}
              title={hideCompleted ? 'Show completed tasks' : 'Hide completed tasks'}>
              <FaFilter className="text-sm group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search tasks..."
          className={`w-full p-1 border-b focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'
          }`}
        />
        <Droppable droppableId="root-droppable" type="TASK">
          {provided => (
            <ul className="flex-grow overflow-y-auto w-full" ref={provided.innerRef} {...provided.droppableProps}>
              {filteredTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  level={0}
                  toggleExpanded={toggleExpanded}
                  isExpanded={expandedTasks[task.id]}
                />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
        <form
          onSubmit={handleAddTask}
          className={`flex w-full fixed bottom-0 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-lg overflow-hidden shadow-md`}>
          <input
            type="text"
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            placeholder="Add a new task"
            className={`flex-grow p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}
          />
          <select
            value={newTaskPriority}
            onChange={e => setNewTaskPriority(e.target.value as Task['priority'])}
            className={`p-1 border-l border-gray-300 dark:border-gray-600 bg-transparent ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
            <FaPlus className="text-sm" />
          </button>
        </form>
      </div>
    </DragDropContext>
  );
};

export default TasksTab;
