import { useEffect, useState } from 'react';
import userApi from '../../api/userApi';
import './Projects.css';

const STATUS_OPTIONS = [
  { value: 'to_do', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'to_do',
  priority: 'medium',
  assigned_to: '',
  due_date: '',
};

export default function TaskModal({ isOpen, onClose, onSubmit, initialTask }) {
  const isEditMode = Boolean(initialTask);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    userApi.getAll().then(({ data }) => setUsers(data.users));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'to_do',
        priority: initialTask.priority || 'medium',
        assigned_to: initialTask.assigned_to || '',
        due_date: initialTask.due_date || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, initialTask]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) {
      nextErrors.title = 'Task title is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card task-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{isEditMode ? 'Edit Task' : 'Add Task'}</h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              value={form.title}
              onChange={handleChange('title')}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" value={form.status} onChange={handleChange('status')}>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={form.priority} onChange={handleChange('priority')}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-assigned">Assigned To</label>
              <select id="task-assigned" value={form.assigned_to} onChange={handleChange('assigned_to')}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                value={form.due_date}
                onChange={handleChange('due_date')}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
