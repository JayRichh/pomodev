import React, { useState, useRef } from 'react';
import { usePomodoroStorage, useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage, Task } from '@extension/storage';
import { FaSearch, FaSort, FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import type { SortBy, Priority } from '@extension/shared/lib/hooks/usePomodoroStorage';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

const priorityColors = {
  low: 'bg-green-200 dark:bg-green-800',
  medium: 'bg-yellow-200 dark:bg-yellow-800',
  high: 'bg-red-200 dark:bg-red-800',
};

interface SortAndFilterMenuProps {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  filterPriority: Priority | 'all';
  setFilterPriority: (priority: Priority | 'all') => void;
  hideCompleted: boolean;
  toggleHideCompleted: () => void;
}

const useOutsideClick = (ref: React.RefObject<HTMLElement>, onClickOutside: () => void) => {
  React.useEffect(() => {
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
export const PriorityDropdown: React.FC<{
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
export const SearchBar: React.FC<SearchBarProps> = ({ searchText, setSearchText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const theme = useStorageSuspense(exampleThemeStorage);

  useOutsideClick(searchRef, () => setIsOpen(false));

  const handleClose = () => {
    setIsOpen(false);
    setSearchText('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Search tasks">
        <FaSearch className="text-gray-600 dark:text-gray-300" size={16} />
      </button>
      {isOpen &&
        createPortal(
          <div ref={searchRef} className="fixed inset-x-0 top-0 z-50 p-4 bg-white dark:bg-gray-800 shadow-lg">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search tasks..."
                className={`w-full p-2 pl-10 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'
                }`}
                autoFocus
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <button
                onClick={handleClose}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                <FaTimes className="text-gray-400" size={16} />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
export const SortAndFilterMenu: React.FC<SortAndFilterMenuProps> = ({
  sortBy,
  setSortBy,
  filterPriority,
  setFilterPriority,
  hideCompleted,
  toggleHideCompleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const theme = useStorageSuspense(exampleThemeStorage);

  useOutsideClick(menuRef, () => setIsOpen(false));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Sort and filter options">
        <FaSort className="text-gray-600 dark:text-gray-300" size={16} />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`fixed right-0 top-0 h-full w-64 z-50 p-4 ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            } shadow-lg overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sort and Filter</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                <FaTimes className="text-gray-600 dark:text-gray-300" size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sort by:</label>
                <select
                  value={`${sortBy.field}-${sortBy.order}`}
                  onChange={e => {
                    const [field, order] = e.target.value.split('-') as [SortBy['field'], SortBy['order']];
                    setSortBy({ field, order });
                  }}
                  className={`w-full p-2 border rounded ${
                    theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'
                  }`}>
                  <option value="createdAt-asc">Created Date (Oldest First)</option>
                  <option value="createdAt-desc">Created Date (Newest First)</option>
                  <option value="priority-asc">Priority (Low to High)</option>
                  <option value="priority-desc">Priority (High to Low)</option>
                  <option value="alphabetical-asc">Alphabetical (A-Z)</option>
                  <option value="alphabetical-desc">Alphabetical (Z-A)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Filter by priority:</label>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
                  className={`w-full p-2 border rounded ${
                    theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'
                  }`}>
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hideCompleted"
                  checked={hideCompleted}
                  onChange={toggleHideCompleted}
                  className="mr-2"
                />
                <label htmlFor="hideCompleted" className="text-sm">
                  Hide completed tasks
                </label>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export const filterAndSortTasks = (
  tasks: Task[],
  hideCompleted: boolean,
  filterPriority: Priority | 'all',
  searchText: string,
  sortBy: SortBy,
): Task[] => {
  return tasks
    .filter(task => !hideCompleted || !task.completed)
    .filter(task => filterPriority === 'all' || task.priority === filterPriority)
    .filter(task => task.text.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      if (sortBy.field === 'createdAt') {
        const comparison = new Date(a.id).getTime() - new Date(b.id).getTime();
        return sortBy.order === 'asc' ? comparison : -comparison;
      }
      if (sortBy.field === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        return sortBy.order === 'asc' ? comparison : -comparison;
      }
      if (sortBy.field === 'alphabetical') {
        const comparison = a.text.localeCompare(b.text);
        return sortBy.order === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
};

export type { Priority, SortBy, SearchBarProps, SortAndFilterMenuProps };
