import { useEffect, useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { useToast } from '../../context/ToastContext';
import projectApi from '../../api/projectApi';
import './Projects.css';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    name: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    start_date: todayStr(),
    end_date: '',
    smartsheet_url: '',
  };
}

export default function ProjectFormModal({ isOpen, onClose, initialProject, onSuccess }) {
  const isEditMode = Boolean(initialProject);
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialProject) {
      setForm({
        name: initialProject.name || '',
        description: initialProject.description || '',
        status: initialProject.status || 'not_started',
        priority: initialProject.priority || 'medium',
        start_date: initialProject.start_date || '',
        end_date: initialProject.end_date || '',
        smartsheet_url: initialProject.smartsheet_url || '',
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [isOpen, initialProject]);

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
    if (!form.name.trim()) {
      nextErrors.name = 'Project name is required';
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      nextErrors.end_date = 'End date must be after start date';
    }
    if (form.smartsheet_url.trim() && !/^https?:\/\/\S+/i.test(form.smartsheet_url.trim())) {
      nextErrors.smartsheet_url = 'Enter a valid URL (starting with http:// or https://)';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        smartsheet_url: form.smartsheet_url.trim() || null,
      };
      if (isEditMode) {
        await projectApi.update(initialProject.id, payload);
        showToast('Project updated', 'success');
      } else {
        await projectApi.create(payload);
        showToast('Project created', 'success');
      }
      onClose();
      onSuccess?.();
    } catch {
      showToast(isEditMode ? 'Failed to update project' : 'Failed to create project', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pfm-backdrop" onClick={onClose}>
      <div className="pfm-card" onClick={(e) => e.stopPropagation()}>
        <div className="pfm-header">
          <h2>{isEditMode ? 'Edit Project' : 'New Project'}</h2>
          <button type="button" className="pfm-close" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>

        <form className="pfm-form" onSubmit={handleSubmit} noValidate>
          <div className="pfm-body">
            <div className="pfm-field">
              <label htmlFor="pfm-name">
                Project Name <span className="pfm-required">*</span>
              </label>
              <input
                id="pfm-name"
                type="text"
                placeholder="Enter project name"
                value={form.name}
                onChange={handleChange('name')}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="pfm-field">
              <label htmlFor="pfm-description">Description</label>
              <textarea
                id="pfm-description"
                rows={3}
                placeholder="What is this project about?"
                value={form.description}
                onChange={handleChange('description')}
              />
            </div>

            <div className="pfm-row">
              <div className="pfm-field">
                <label htmlFor="pfm-status">Status</label>
                <select id="pfm-status" value={form.status} onChange={handleChange('status')}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pfm-field">
                <label htmlFor="pfm-priority">Priority</label>
                <select id="pfm-priority" value={form.priority} onChange={handleChange('priority')}>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pfm-row">
              <div className="pfm-field">
                <label htmlFor="pfm-start">Start Date</label>
                <input
                  id="pfm-start"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange('start_date')}
                />
              </div>

              <div className="pfm-field">
                <label htmlFor="pfm-end">End Date</label>
                <input
                  id="pfm-end"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange('end_date')}
                  className={errors.end_date ? 'input-error' : ''}
                />
                {errors.end_date && <span className="field-error">{errors.end_date}</span>}
              </div>
            </div>

            <div className="pfm-field">
              <label htmlFor="pfm-smartsheet">Smartsheet Link</label>
              <input
                id="pfm-smartsheet"
                type="url"
                placeholder="https://app.smartsheet.com/sheets/..."
                value={form.smartsheet_url}
                onChange={handleChange('smartsheet_url')}
                className={errors.smartsheet_url ? 'input-error' : ''}
              />
              {errors.smartsheet_url && <span className="field-error">{errors.smartsheet_url}</span>}
            </div>
          </div>

          <div className="pfm-footer">
            <button
              type="button"
              className="btn btn-secondary pfm-footer-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary pfm-footer-btn" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
