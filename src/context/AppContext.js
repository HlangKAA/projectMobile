import React, { createContext, useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../config/firebase";

export const AppContext = createContext();

// ── Firestore Collection Names ──────────────────────────────────────────────
const COL = {
  courses: "courses",
  activities: "activities",
  exams: "exams",
  makeupClasses: "makeupClasses",
  studyPlan: "studyPlan",
};

export const AppProvider = ({ children }) => {
  // Simulated date (can be changed from Profile)
  const [simulatedDate, setSimulatedDate] = useState(new Date());

  // ── State ──────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [exams, setExams] = useState([]);
  const [makeupClasses, setMakeupClasses] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [firestoreReady, setFirestoreReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // ── Auth & Profile Listener ────────────────────────────────────────────────
  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user profile from Firestore in real-time
        unsubProfile = onSnapshot(
          doc(db, "users", user.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile({ uid: user.uid, ...docSnap.data() });
            } else {
              setUserProfile({ uid: user.uid });
            }
          },
          (err) => {
            console.warn("Error fetching user profile:", err.message);
            setUserProfile({ uid: user.uid });
          },
        );
      } else {
        setUserProfile(null);
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // ── Firestore Real-time Listeners ──────────────────────────────────────────
  useEffect(() => {
    const unsubs = [];

    const listen = (colName, setter, transform) => {
      const q = collection(db, colName);
      const unsub = onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs.map((d) =>
            transform ? transform(d) : { id: d.id, ...d.data() },
          );
          setter(docs);
        },
        (err) => {
          console.warn(`Firestore onSnapshot error [${colName}]:`, err.message);
          // Fall back to initial mock data if Firestore is unavailable
        },
      );
      unsubs.push(unsub);
    };

    listen(COL.courses, setCourses);
    listen(COL.activities, setActivities);
    listen(COL.exams, setExams);
    listen(COL.makeupClasses, setMakeupClasses);
    listen(COL.studyPlan, setStudyPlan);

    // Seed initial data if Firestore is empty on first launch (Disabled per user request)
    // seedInitialDataIfEmpty();

    setFirestoreReady(true);

    return () => unsubs.forEach((u) => u());
  }, []);

  const seedInitialDataIfEmpty = async () => {
    try {
      const snap = await getDocs(collection(db, COL.courses));
      if (!snap.empty) return; // Already seeded

      const batch = writeBatch(db);

      // Initial courses
      const initialCourses = [
        {
          id: "course_0",
          code: "03751111",
          name: "Man and Environment",
          time: "09:00 - 12:00",
          room: "KH80 - 207",
          day: "Wed",
        },
        {
          id: "course_1",
          code: "01418342",
          name: "Mobile Application Design and Development",
          time: "16:00 - 18:00",
          room: "SC 9 - 330",
          day: "Wed",
        },
        {
          id: "course_2",
          code: "01418342",
          name: "Mobile Application Design and Development",
          time: "18:00 - 20:00",
          room: "SC 9 - 330",
          day: "Wed",
        },
        {
          id: "course_math",
          code: "01416101",
          name: "Math",
          time: "09:00 - 11:00",
          room: "SC 45 - 101",
          day: "Mon",
        },
      ];

      initialCourses.forEach((c) => {
        batch.set(doc(db, COL.courses, c.id), c);
      });

      // Initial activities
      const initialActivities = [
        {
          id: "act_1",
          name: "ปิงปอง",
          time: "16:30-18:30",
          day: "Mon",
          icon: "tennisball-outline",
          color: "#EF5350",
        },
        {
          id: "act_2",
          name: "ฟุตบอล",
          time: "19:30-20:30",
          day: "Tue",
          icon: "football-outline",
          color: "#424242",
        },
      ];
      initialActivities.forEach((a) => {
        batch.set(doc(db, COL.activities, String(a.id)), a);
      });

      // Initial exams
      const initialExams = [
        {
          id: "exam_1",
          subject: "Mobile Application Design and Development",
          code: "01418342",
          date: "2026-03-21",
          time: "13:00 - 16:00",
          room: "SC 9 - 330",
        },
        {
          id: "exam_2",
          subject: "Sufficiency Economy for Living",
          code: "02999044",
          date: "2026-03-24",
          time: "09:00 - 11:00",
          room: "LH 2 - 206",
        },
        {
          id: "exam_3",
          subject: "Introduction to Data Science",
          code: "01418322",
          date: "2026-03-18",
          time: "17:00 - 20:00",
          room: "SC 9 - 402",
        },
        {
          id: "exam_math",
          subject: "Math",
          code: "01416101",
          date: "2026-04-10",
          time: "09:00 - 11:00",
          room: "SC 45 - 201",
        },
      ];
      initialExams.forEach((e) => {
        batch.set(doc(db, COL.exams, String(e.id)), e);
      });

      // Initial study plan
      const initialStudyPlan = [
        {
          id: "task_1",
          title: "เขียนสรุปวิชา Mobile Application",
          completed: true,
        },
        {
          id: "task_2",
          title: "เขียนสรุปวิชา Introduction to Data Science",
          completed: false,
        },
        {
          id: "task_3",
          title: "เขียนสรุปวิชา Introduction to System Security",
          completed: false,
        },
      ];
      initialStudyPlan.forEach((t) => {
        batch.set(doc(db, COL.studyPlan, String(t.id)), t);
      });

      await batch.commit();
      console.log("✅ Firestore seeded with initial data");
    } catch (err) {
      console.warn("Seed error:", err.message);
    }
  };

  // ── Courses ────────────────────────────────────────────────────────────────
  const addCourse = async (course) => {
    try {
      await setDoc(doc(db, COL.courses, course.id), course);
    } catch (err) {
      console.warn("addCourse error:", err.message);
      setCourses((prev) => [...prev, course]);
    }
  };

  const deleteCourse = async (id) => {
    try {
      // Find the course name to cascade-delete linked exams
      const course = courses.find((c) => c.id === id);
      const batch = writeBatch(db);

      // Delete the course
      batch.delete(doc(db, COL.courses, id));

      // Cascade delete: remove all exams whose subject matches this course name
      if (course) {
        const examSnap = await getDocs(collection(db, COL.exams));
        examSnap.docs.forEach((d) => {
          if (d.data().subject === course.name) {
            batch.delete(doc(db, COL.exams, d.id));
          }
        });
      }

      await batch.commit();
    } catch (err) {
      console.warn("deleteCourse error:", err.message);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // ── Activities ─────────────────────────────────────────────────────────────
  const addActivity = async (activity) => {
    try {
      await setDoc(doc(db, COL.activities, String(activity.id)), activity);
    } catch (err) {
      console.warn("addActivity error:", err.message);
      setActivities((prev) => [...prev, activity]);
    }
  };

  const deleteActivity = async (id) => {
    try {
      await deleteDoc(doc(db, COL.activities, String(id)));
    } catch (err) {
      console.warn("deleteActivity error:", err.message);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // ── Exams ──────────────────────────────────────────────────────────────────
  const addExam = async (exam) => {
    try {
      await setDoc(doc(db, COL.exams, String(exam.id)), exam);
    } catch (err) {
      console.warn("addExam error:", err.message);
      setExams((prev) => [...prev, exam]);
    }
  };

  const deleteExam = async (id) => {
    try {
      await deleteDoc(doc(db, COL.exams, String(id)));
    } catch (err) {
      console.warn("deleteExam error:", err.message);
      setExams((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // ── Makeup Classes ─────────────────────────────────────────────────────────
  const addMakeupClass = async (cls) => {
    try {
      await setDoc(doc(db, COL.makeupClasses, cls.id), cls);
    } catch (err) {
      console.warn("addMakeupClass error:", err.message);
      setMakeupClasses((prev) => [...prev, cls]);
    }
  };

  const deleteMakeupClass = async (id) => {
    try {
      await deleteDoc(doc(db, COL.makeupClasses, id));
    } catch (err) {
      console.warn("deleteMakeupClass error:", err.message);
      setMakeupClasses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // ── Study Plan ─────────────────────────────────────────────────────────────
  const addStudyTask = async (title) => {
    const newTask = { id: `task_${Date.now()}`, title, completed: false };
    try {
      await setDoc(doc(db, COL.studyPlan, newTask.id), newTask);
    } catch (err) {
      console.warn("addStudyTask error:", err.message);
      setStudyPlan((prev) => [...prev, newTask]);
    }
  };

  const toggleStudyPlanItem = async (id) => {
    const task = studyPlan.find((t) => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    try {
      await setDoc(doc(db, COL.studyPlan, String(id)), updated);
    } catch (err) {
      console.warn("toggleStudyPlanItem error:", err.message);
      setStudyPlan((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const clearStudyPlan = async () => {
    try {
      const batch = writeBatch(db);
      studyPlan.forEach((t) =>
        batch.delete(doc(db, COL.studyPlan, String(t.id))),
      );
      await batch.commit();
    } catch (err) {
      console.warn("clearStudyPlan error:", err.message);
      setStudyPlan([]);
    }
  };

  const deleteStudyTask = async (id) => {
    try {
      await deleteDoc(doc(db, COL.studyPlan, String(id)));
    } catch (err) {
      console.warn("deleteStudyTask error:", err.message);
      setStudyPlan((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // ── Reset All (Test Case 3) ────────────────────────────────────────────────
  const resetAll = async () => {
    try {
      const batch = writeBatch(db);
      const deleteAll = async (colName) => {
        const snap = await getDocs(collection(db, colName));
        snap.docs.forEach((d) => batch.delete(doc(db, colName, d.id)));
      };
      await Promise.all(Object.values(COL).map(deleteAll));
      await batch.commit();
    } catch (err) {
      console.warn("resetAll error:", err.message);
      setCourses([]);
      setActivities([]);
      setExams([]);
      setMakeupClasses([]);
      setStudyPlan([]);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Logout error:", err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        simulatedDate,
        setSimulatedDate,
        firestoreReady,
        // Courses
        courses,
        addCourse,
        deleteCourse,
        // Activities
        activities,
        addActivity,
        deleteActivity,
        // Exams
        exams,
        addExam,
        deleteExam,
        // Makeup
        makeupClasses,
        addMakeupClass,
        deleteMakeupClass,
        // Study Plan
        studyPlan,
        addStudyTask,
        deleteStudyTask,
        toggleStudyPlanItem,
        clearStudyPlan,
        // Reset
        resetAll,
        // Auth & Profile
        currentUser,
        userProfile,
        setUserProfile,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
