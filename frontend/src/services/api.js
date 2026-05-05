import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: (username, password, role) => {
    return api.post('/login', { username, password, role });
  },
  getStudentCount: () => {
    return api.get('/student-count');
  }
};

export const assignmentApi = {
  create: (data) => {
    return api.post('/assignments', data);
  },
  getTeacherAssignments: (teacherId) => {
    return api.get(`/assignments/teacher?teacher_id=${teacherId}`);
  },
  getStudentAssignments: (studentId) => {
    return api.get(`/assignments/student?student_id=${studentId}`);
  },
  getById: (id) => {
    return api.get(`/assignments/${id}`);
  },
  delete: (id) => {
    return api.delete(`/assignments/${id}`);
  },
  markAsViewed: (studentId, assignmentId) => {
    return api.post('/assignments/viewed', { student_id: studentId, assignment_id: assignmentId });
  }
};

export default api;
