import React, { useState } from 'react';
import { assignmentApi } from '../services/api';

function CreateAssignment({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    deadline: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('请输入作业名称');
      return;
    }
    if (!formData.content.trim()) {
      setError('请输入作业内容');
      return;
    }
    if (!formData.deadline) {
      setError('请选择截止时间');
      return;
    }

    setLoading(true);
    try {
      await assignmentApi.create({
        name: formData.name,
        content: formData.content,
        deadline: formData.deadline,
        teacher_id: user.id,
        teacher_name: user.username
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '布置作业失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>布置新作业</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>作业名称</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入作业名称"
                required
              />
            </div>

            <div className="form-group">
              <label>作业内容</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="请输入作业内容详情..."
                required
              />
            </div>

            <div className="form-group">
              <label>提交截止时间</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary btn-small"
              onClick={onClose}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-small"
              disabled={loading}
            >
              {loading ? '提交中...' : '确认布置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAssignment;
