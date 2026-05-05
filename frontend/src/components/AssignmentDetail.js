import React, { useEffect } from 'react';
import { assignmentApi } from '../services/api';

function AssignmentDetail({ assignment, onClose, isTeacher, studentId }) {
  useEffect(() => {
    if (!isTeacher && studentId) {
      assignmentApi.markAsViewed(studentId, assignment.id).catch(() => {});
    }
  }, [isTeacher, studentId, assignment.id]);

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>作业详情</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="assignment-detail">
            <h3>{assignment.name}</h3>
            
            <div className="detail-row">
              <span className="detail-label">布置教师</span>
              <span className="detail-value">{assignment.teacher_name}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">布置时间</span>
              <span className="detail-value">{formatDate(assignment.created_at)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">截止时间</span>
              <span className="detail-value">{formatDate(assignment.deadline)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">作业内容</span>
              <div className="detail-value detail-content">
                <p>{assignment.content}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary btn-small"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignmentDetail;
