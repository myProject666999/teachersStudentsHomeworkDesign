import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentApi } from '../services/api';
import CreateAssignment from '../components/CreateAssignment';
import AssignmentList from '../components/AssignmentList';

function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    if (parsedUser.role !== 'teacher') {
      navigate('/');
      return;
    }
    
    setUser(parsedUser);
  }, [navigate]);

  const loadAssignments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await assignmentApi.getTeacherAssignments(user.id);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('加载作业列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'view') {
      loadAssignments();
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setActiveTab('view');
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('确定要删除这个作业吗？')) {
      try {
        await assignmentApi.delete(id);
        loadAssignments();
      } catch (err) {
        alert('删除失败，请重试');
      }
    }
  };

  if (!user) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <header className="header">
        <h2>教师工作台</h2>
        <div className="user-info">
          <span className="username">欢迎，{user.username}</span>
          <span className="role-badge teacher">教师</span>
          <button className="btn btn-secondary btn-small" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      <div className="dashboard">
        {activeTab === 'home' && (
          <div>
            <div className="dashboard-header">
              <h3>作业管理</h3>
            </div>
            <div className="action-buttons">
              <div 
                className="action-button"
                onClick={() => setShowCreateModal(true)}
              >
                <div className="icon">📝</div>
                <div className="title">布置作业</div>
              </div>
              <div 
                className="action-button"
                onClick={() => setActiveTab('view')}
              >
                <div className="icon">📋</div>
                <div className="title">查看作业</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div>
            <div className="dashboard-header">
              <h3>已布置的作业</h3>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => setActiveTab('home')}
              >
                ← 返回
              </button>
            </div>
            <AssignmentList
              assignments={assignments}
              loading={loading}
              onDelete={handleDeleteAssignment}
              isTeacher={true}
            />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAssignment
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

export default TeacherDashboard;
