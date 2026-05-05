import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, assignmentApi } from '../services/api';
import AssignmentList from '../components/AssignmentList';

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'student') {
      navigate('/');
      return;
    }
    
    setUser(parsedUser);
  }, [navigate]);

  const loadStudentCount = async () => {
    try {
      const response = await authApi.getStudentCount();
      setStudentCount(response.data.count);
    } catch (err) {
      console.error('加载学生人数失败:', err);
    }
  };

  const loadAssignments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await assignmentApi.getStudentAssignments(user.id);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('加载作业列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStudentCount();
      loadAssignments();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRefresh = () => {
    loadAssignments();
  };

  if (!user) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <header className="header">
        <h2>学生工作台</h2>
        <div className="user-info">
          <span className="username">欢迎，{user.username}</span>
          <span className="role-badge student">学生</span>
          <button className="btn btn-secondary btn-small" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      <div className="dashboard">
        <div className="student-count">
          <div className="icon">👥</div>
          <div>
            <div className="text">当前班级学生人数</div>
            <div className="number">{studentCount}</div>
          </div>
        </div>

        <div className="dashboard-header">
          <h3>我的作业</h3>
          <button 
            className="btn btn-secondary btn-small"
            onClick={handleRefresh}
          >
            🔄 刷新
          </button>
        </div>

        <AssignmentList
          assignments={assignments}
          loading={loading}
          isTeacher={false}
          studentId={user.id}
        />
      </div>
    </div>
  );
}

export default StudentDashboard;
