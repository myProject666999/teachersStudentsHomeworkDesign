package main

import (
	"teachersStudentsHomework/handlers"
	"teachersStudentsHomework/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db := models.InitDB()

	authHandler := &handlers.AuthHandler{DB: db}
	assignmentHandler := &handlers.AssignmentHandler{DB: db}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.POST("/login", authHandler.Login)
		api.GET("/student-count", authHandler.GetStudentCount)

		api.POST("/assignments", assignmentHandler.CreateAssignment)
		api.GET("/assignments/teacher", assignmentHandler.GetTeacherAssignments)
		api.GET("/assignments/student", assignmentHandler.GetStudentAssignments)
		api.GET("/assignments/:id", assignmentHandler.GetAssignmentByID)
		api.DELETE("/assignments/:id", assignmentHandler.DeleteAssignment)
		api.POST("/assignments/viewed", assignmentHandler.MarkAsViewed)
	}

	r.Run(":8081")
}
