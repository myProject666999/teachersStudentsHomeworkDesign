package models

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type User struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"not null" json:"-"`
	Role      string    `gorm:"not null" json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type Assignment struct {
	ID           uint      `gorm:"primary_key" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Content      string    `gorm:"not null" json:"content"`
	Deadline     time.Time `gorm:"not null" json:"deadline"`
	TeacherID    uint      `gorm:"not null" json:"teacher_id"`
	TeacherName  string    `gorm:"not null" json:"teacher_name"`
	CreatedAt    time.Time `json:"created_at"`
}

type StudentAssignment struct {
	ID            uint      `gorm:"primary_key" json:"id"`
	StudentID     uint      `gorm:"not null" json:"student_id"`
	AssignmentID  uint      `gorm:"not null" json:"assignment_id"`
	Viewed        bool      `gorm:"default:false" json:"viewed"`
	ViewedAt      time.Time `json:"viewed_at"`
	CreatedAt     time.Time `json:"created_at"`
}

func InitDB() *gorm.DB {
	sqlDB, err := sql.Open("sqlite", "homework.db")
	if err != nil {
		panic("failed to open database: " + err.Error())
	}

	db, err := gorm.Open(sqlite.Dialector{
		Conn: sqlDB,
	}, &gorm.Config{})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	db.AutoMigrate(&User{}, &Assignment{}, &StudentAssignment{})

	seedData(db)

	return db
}

func seedData(db *gorm.DB) {
	var count int64
	db.Model(&User{}).Count(&count)
	if count > 0 {
		return
	}

	teachers := []User{
		{Username: "teacher1", Password: "123456", Role: "teacher", CreatedAt: time.Now()},
		{Username: "teacher2", Password: "123456", Role: "teacher", CreatedAt: time.Now()},
	}

	students := []User{
		{Username: "student1", Password: "123456", Role: "student", CreatedAt: time.Now()},
		{Username: "student2", Password: "123456", Role: "student", CreatedAt: time.Now()},
		{Username: "student3", Password: "123456", Role: "student", CreatedAt: time.Now()},
	}

	for _, t := range teachers {
		db.Create(&t)
	}

	for _, s := range students {
		db.Create(&s)
	}
}
