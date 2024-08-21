import React, { useState } from 'react'
import { useStorageSuspense } from '@extension/shared'
import { pomodoroStorage, exampleThemeStorage } from '@extension/storage'
import '@src/Popup.css';

const TasksTab: React.FC = () => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const pomodoroState = useStorageSuspense(pomodoroStorage)
  const { tasks, hideCompleted } = pomodoroState
  const theme = useStorageSuspense(exampleThemeStorage)
  const isLight = theme === 'light'

  const filteredTasks = hideCompleted ? tasks.filter(task => !task.completed) : tasks

  return (
    <div className="flex-grow flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={() => pomodoroStorage.toggleHideCompleted()}
            className="mr-2 form-checkbox h-5 w-5 text-blue-500"
          />
          Hide completed tasks
        </label>
      </div>
      <ul className="space-y-2 mb-4 flex-grow overflow-y-auto">
        {filteredTasks.map((task) => (
          <li key={task.id} className="flex items-center p-2 bg-opacity-50 rounded-md">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => pomodoroStorage.toggleTask(task.id)}
              className="mr-2 form-checkbox h-5 w-5 text-blue-500 transition duration-150 ease-in-out"
            />
            {editingTaskId === task.id ? (
              <input
                type="text"
                value={task.text}
                onChange={(e) => pomodoroStorage.updateTask(task.id, e.target.value)}
                onBlur={() => setEditingTaskId(null)}
                className="flex-grow p-1 rounded"
                autoFocus
              />
            ) : (
              <span
                className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}
                onDoubleClick={() => setEditingTaskId(task.id)}
              >
                {task.text}
              </span>
            )}
            <button
              onClick={() => pomodoroStorage.deleteTask(task.id)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => {
        e.preventDefault()
        const input = e.currentTarget.elements.namedItem('newTask') as HTMLInputElement
        if (input.value.trim()) {
          pomodoroStorage.addTask(input.value.trim())
          input.value = ''
        }
      }} className="flex">
        <input
          type="text"
          name="newTask"
          placeholder="Add a new task"
          className={`flex-grow p-2 rounded-l-md ${
            isLight ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white'
          } border-2 border-r-0 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500`}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors duration-300"
        >
          Add
        </button>
      </form>
    </div>
  )
}

export default TasksTab
