import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Simulated date for testing (can be changed from Profile)
  const [simulatedDate, setSimulatedDate] = useState(new Date());

  // Initial Mock Data for Courses
  const [courses, setCourses] = useState([
    {
      id: "0",
      code: "03751111",
      name: "Man and Environment",
      time: "09:00 - 12:00",
      room: "KH80 - 207",
      day: "Wed",
    },
    {
      id: "1",
      code: "01418342",
      name: "Mobile Application Design and Development",
      time: "16:00 - 18:00",
      room: "SC 9 - 330",
      day: "Wed",
    },
    {
      id: "2",
      code: "01418342",
      name: "Mobile Application Design and Development",
      time: "18:00 - 20:00",
      room: "SC 9 - 330",
      day: "Wed",
    },
  ]);

  // Initial Mock Data for Activities
  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "ปิงปอง",
      time: "16.30-18.30",
      day: "Mon",
      icon: "tennisball-outline",
      color: "#EF5350",
    },
    {
      id: 2,
      name: "ฟุตบอล",
      time: "19.30-20.30",
      day: "Tue",
      icon: "football-outline",
      color: "#424242",
    },
  ]);

  // Initial Mock Data for Exams
  const [exams, setExams] = useState([
    {
      id: 1,
      subject: "Mobile Application Design and Development",
      code: "01418342",
      date: "2026-03-21",
      time: "13:00 - 16:00",
      room: "SC 9 - 330",
    },
    {
      id: 2,
      subject: "Sufficiency Economy for Living",
      code: "02999044",
      date: "2026-03-24",
      time: "09:00 - 11:00",
      room: "LH 2 - 206",
    },
    {
      id: 3,
      subject: "Introduction to Data Science",
      code: "01418322",
      date: "2026-03-18",
      time: "17:00 - 20:00",
      room: "SC 9 - 402",
    },
  ]);

  // Initial Mock Data for Study Plan
  const [studyPlan, setStudyPlan] = useState([
    { id: 1, title: "เขียนสรุปวิชา Mobile Application", completed: true },
    {
      id: 2,
      title: "เขียนสรุปวิชา Introduction to Data Science",
      completed: false,
    },
    {
      id: 3,
      title: "เขียนสรุปวิชา Introduction to system Security",
      completed: false,
    },
  ]);

  const addCourse = (course) => {
    setCourses([...courses, course]);
  };

  const addActivity = (activity) => {
    setActivities([...activities, activity]);
  };

  const addExam = (exam) => {
    setExams([...exams, exam]);
  };

  const toggleStudyPlanItem = (id) => {
    setStudyPlan(
      studyPlan.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const addStudyTask = (title) => {
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    };
    setStudyPlan([...studyPlan, newTask]);
  };

  return (
    <AppContext.Provider
      value={{
        simulatedDate,
        setSimulatedDate,
        courses,
        addCourse,
        activities,
        addActivity,
        exams,
        addExam,
        studyPlan,
        toggleStudyPlanItem,
        addStudyTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
