import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiClipboard
} from 'react-icons/fi';
import { todoAPI } from './api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.checked).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [todos]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await todoAPI.getTodos();
      setTodos(response.data || []);
    } catch (err) {
      setError('Failed to load todos. Make sure your API is running.');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setError('');
      const response = await todoAPI.createTodo(newTodo.trim());
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      setError('');
      const updatedTodo = { ...todo, checked: !todo.checked };
      await todoAPI.updateTodo(todo.id, updatedTodo);
      setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setError('');
      await todoAPI.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const handleEditStart = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleEditSave = async (id) => {
    if (!editText.trim()) return;

    try {
      setError('');
      const todo = todos.find(t => t.id === id);
      const updatedTodo = { ...todo, text: editText.trim() };
      await todoAPI.updateTodo(id, updatedTodo);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>Loading your todos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>✨ Todo App</h1>
        <p>Organize your life, one task at a time</p>
      </motion.div>

      {stats.total > 0 && (
        <motion.div
          className="stats"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="stat-item">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            className="error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FiAlertCircle />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleAddTodo}
        className="add-todo"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
        />
        <button type="submit" disabled={!newTodo.trim()}>
          <FiPlus />
          Add Task
        </button>
      </motion.form>

      <ul className="todo-list">
        <AnimatePresence>
          {todos.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FiClipboard className="empty-state-icon" />
              <h3>No tasks yet</h3>
              <p>Add your first task above to get started!</p>
            </motion.div>
          ) : (
            todos.map((todo, index) => (
              <motion.li
                key={todo.id}
                className={`todo-item ${todo.checked ? 'completed' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                layout
              >
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={todo.checked}
                    onChange={() => handleToggleTodo(todo)}
                  />
                  <span className="checkmark">
                    <FiCheck className="checkmark-icon" />
                  </span>
                </label>

                {editingId === todo.id ? (
                  <motion.div
                    className="edit-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditSave(todo.id)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-save"
                      onClick={() => handleEditSave(todo.id)}
                    >
                      <FiSave />
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleEditCancel}
                    >
                      <FiX />
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <span className={`todo-text ${todo.checked ? 'completed' : ''}`}>
                      {todo.text}
                    </span>
                    <div className="todo-actions">
                      <button
                        className="action-btn btn-edit"
                        onClick={() => handleEditStart(todo)}
                        title="Edit task"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDeleteTodo(todo.id)}
                        title="Delete task"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </>
                )}
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default App;
