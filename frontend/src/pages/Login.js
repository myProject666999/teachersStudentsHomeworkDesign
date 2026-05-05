import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

function Login() {
  const [role, setRole] = useState('teacher');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password, role);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>作业设计系统</h1>
        
        <div className="role-selector">
          <div 
            className={`role-option ${role === 'teacher' ? 'selected' : ''}`}
            onClick={() => setRole('teacher')}
          >
            <div className="icon">👨‍🏫</div>
            <div className="label">教师登录</div>
          </div>
          <div 
            className={`role-option ${role === 'student' ? 'selected' : ''}`}
            onClick={() => setRole('student')}
          >
            <div className="icon">👨‍🎓</div>
            <div className="label">学生登录</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === 'teacher' ? '请输入教师用户名（如teacher1）' : '请输入学生用户名（如student1）'}
              required
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码（默认123456）"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
