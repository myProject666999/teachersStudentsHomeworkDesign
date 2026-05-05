package handlers

import (
	"net/http"
	"strconv"
	"teachersStudentsHomework/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AssignmentHandler struct {
	DB *gorm.DB
}

type CreateAssignmentRequest struct {
	Name        string `json:"name" binding:"required"`
	Content     string `json:"content" binding:"required"`
	Deadline    string `json:"deadline" binding:"required"`
	TeacherID   uint   `json:"teacher_id" binding:"required"`
	TeacherName string `json:"teacher_name" binding:"required"`
}

func (h *AssignmentHandler) CreateAssignment(c *gin.Context) {
	var req CreateAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误: " + err.Error()})
		return
	}

	deadline, err := time.Parse("2006-01-02T15:04", req.Deadline)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "截止时间格式错误"})
		return
	}

	assignment := models.Assignment{
		Name:        req.Name,
		Content:     req.Content,
		Deadline:    deadline,
		TeacherID:   req.TeacherID,
		TeacherName: req.TeacherName,
		CreatedAt:   time.Now(),
	}

	if err := h.DB.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建作业失败"})
		return
	}

	var students []models.User
	h.DB.Where("role = ?", "student").Find(&students)

	for _, student := range students {
		studentAssignment := models.StudentAssignment{
			StudentID:    student.ID,
			AssignmentID: assignment.ID,
			Viewed:       false,
			CreatedAt:    time.Now(),
		}
		h.DB.Create(&studentAssignment)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "作业布置成功",
		"assignment": assignment,
	})
}

func (h *AssignmentHandler) GetTeacherAssignments(c *gin.Context) {
	teacherID, err := strconv.ParseUint(c.Query("teacher_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "教师ID参数错误"})
		return
	}

	var assignments []models.Assignment
	h.DB.Where("teacher_id = ?", uint(teacherID)).Order("created_at desc").Find(&assignments)

	c.JSON(http.StatusOK, gin.H{
		"assignments": assignments,
	})
}

func (h *AssignmentHandler) GetStudentAssignments(c *gin.Context) {
	studentID, err := strconv.ParseUint(c.Query("student_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "学生ID参数错误"})
		return
	}

	var studentAssignments []models.StudentAssignment
	h.DB.Where("student_id = ?", uint(studentID)).Find(&studentAssignments)

	var assignmentIDs []uint
	for _, sa := range studentAssignments {
		assignmentIDs = append(assignmentIDs, sa.AssignmentID)
	}

	var assignments []models.Assignment
	if len(assignmentIDs) > 0 {
		h.DB.Where("id IN (?)", assignmentIDs).Order("created_at desc").Find(&assignments)
	}

	c.JSON(http.StatusOK, gin.H{
		"assignments": assignments,
	})
}

func (h *AssignmentHandler) GetAssignmentByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "作业ID参数错误"})
		return
	}

	var assignment models.Assignment
	if err := h.DB.First(&assignment, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "作业不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"assignment": assignment,
	})
}

func (h *AssignmentHandler) MarkAsViewed(c *gin.Context) {
	type MarkViewedRequest struct {
		StudentID    uint `json:"student_id" binding:"required"`
		AssignmentID uint `json:"assignment_id" binding:"required"`
	}

	var req MarkViewedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	var sa models.StudentAssignment
	if err := h.DB.Where("student_id = ? AND assignment_id = ?",
		req.StudentID, req.AssignmentID).First(&sa).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}

	sa.Viewed = true
	sa.ViewedAt = time.Now()
	h.DB.Save(&sa)

	c.JSON(http.StatusOK, gin.H{"message": "已标记为已查看"})
}

func (h *AssignmentHandler) DeleteAssignment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "作业ID参数错误"})
		return
	}

	var assignment models.Assignment
	if err := h.DB.First(&assignment, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "作业不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}

	h.DB.Where("assignment_id = ?", uint(id)).Delete(&models.StudentAssignment{})

	if err := h.DB.Delete(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除作业失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "作业删除成功"})
}
