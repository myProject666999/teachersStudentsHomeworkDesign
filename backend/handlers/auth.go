package handlers

import (
	"net/http"
	"teachersStudentsHomework/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	var user models.User
	if err := h.DB.Where("username = ? AND password = ? AND role = ?",
		req.Username, req.Password, req.Role).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误，或角色不匹配"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "登录成功",
		"user":    user,
	})
}

func (h *AuthHandler) GetStudentCount(c *gin.Context) {
	var count int64
	h.DB.Model(&models.User{}).Where("role = ?", "student").Count(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}
