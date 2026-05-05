import React, { useState } from 'react';
import AssignmentDetail from './AssignmentDetail';

function AssignmentList({ assignments, loading, onDelete, isTeacher, studentId }) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffHours = (deadlineDate - now) / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return 'deadline-overdue';
    } else if (diffHours < 24) {
      return 'deadline-upcoming';
    }
    return 'deadline-normal';
  };

  if (loading) {
    return (
      <div className="assignment-list">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="assignment-list">
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>暂无作业记录</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="assignment-list">
        <div className="assignment-list-header">
          <h4>共 {assignments.length} 条作业记录</h4>
        </div>
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-item">
            <div className="assignment-info">
              <div 
                className="assignment-name"
                onClick={() => setSelectedAssignment(assignment)}
              >
                📄 {assignment.name}
              </div>
              <div className="assignment-meta">
                <span>👤 {isTeacher ? '布置时间' : '布置教师'}: {isTeacher ? formatDate(assignment.created_at) : assignment.teacher_name}</span>
                <span className={getDeadlineStatus(assignment.deadline)}>
                  ⏰ 截止时间: {formatDate(assignment.deadline)}
                  {getDeadlineStatus(assignment.deadline) === 'deadline-overdue' && ' (已过期)'}
                  {getDeadlineStatus(assignment.deadline) === 'deadline-upcoming' && ' (即将截止)'}
                </span>
              </div>
            </div>
            <div className="assignment-actions">
              <button 
                className="btn btn-primary btn-small"
                onClick={() => setSelectedAssignment(assignment)}
              >
                查看详情
              </button>
              {isTeacher && (
                <button 
                  className="btn btn-danger btn-small"
                  onClick={() => onDelete(assignment.id)}
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedAssignment && (
        <AssignmentDetail
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          isTeacher={isTeacher}
          studentId={studentId}
        />
      )}
    </div>
  );
}

export default AssignmentList;
