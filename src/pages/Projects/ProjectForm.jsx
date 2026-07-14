import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import projectApi from '../../api/projectApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Projects.css';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  status: 'not_started',
  priority: 'medium',
  start_date: '',
  end_date: '',
};

export default function ProjectForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    async function loadProject() {
      const { data } = await projectApi.getById(id);
      if (cancelled) return;
      const p = data.project;
      setForm({
        name: p.name || '',
        description: p.description || '',
        status: p.status || 'not_started',
        priority: p.priority || 'medium',
        start_date: p.start_date || '',
        end_date: p.end_date || '',
      });
      setLoading(false);
    }

    loadProject();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

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
      };
      if (isEditMode) {
        await projectApi.update(id, payload);
        showToast('Project updated', 'success');
      } else {
        await projectApi.create(payload);
        showToast('Project created', 'success');
      }
      navigate('/projects');
    } catch {
      showToast(isEditMode ? 'Failed to update project' : 'Failed to create project', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="project-form-page">
      <h1>{isEditMode ? 'Edit Project' : 'Create New Project'}</h1>

      <form className="project-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="name">Project Name</label>
          <input
            id="name"
            type="text"
            maxLength={100}
            value={form.name}
            onChange={handleChange('name')}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            maxLength={500}
            rows={4}
            value={form.description}
            onChange={handleChange('description')}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" value={form.status} onChange={handleChange('status')}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={form.priority} onChange={handleChange('priority')}>
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
            <label htmlFor="start_date">Start Date</label>
            <input
              id="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange('start_date')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="end_date">End Date</label>
            <input
              id="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange('end_date')}
              className={errors.end_date ? 'input-error' : ''}
            />
            {errors.end_date && <span className="field-error">{errors.end_date}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/projects')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
