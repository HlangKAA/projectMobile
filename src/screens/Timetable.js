import React, { useState, useContext, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TimePickerModal from "../components/TimePickerModal";
import DatePickerModal from "../components/DatePickerModal";
import { AppContext } from "../context/AppContext";
import {
  isOverlapping,
  isTimeCurrent,
  isTimeUpcoming,
} from "../utils/timeUtils";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const THAI_DAY_LABELS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const Timetable = () => {
  const {
    courses,
    addCourse,
    deleteCourse,
    exams,
    addExam,
    deleteExam,
    makeupClasses,
    addMakeupClass,
    deleteMakeupClass,
    simulatedDate,
  } = useContext(AppContext);

  const [mode, setMode] = useState("Timetable");
  const [modalVisible, setModalVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [room, setRoom] = useState("");

  // Time Picker State
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Date/Day Picker State
  const [targetDay, setTargetDay] = useState("Mon"); // For Course
  const [examDate, setExamDate] = useState(new Date()); // For Exam
  const [showDatePicker, setShowDatePicker] = useState(false); // For Exam Date

  // Subject Selector State (for Exams)
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);

  // Dynamic calendar strip based on simulatedDate
  const calendarWeek = useMemo(() => {
    const d = new Date(simulatedDate);
    const dayOfWeek = d.getDay(); // 0=Sun
    // Get Monday of this week
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayIdx = day.getDay();
      week.push({
        short: THAI_DAY_LABELS[dayIdx],
        date: day.getDate().toString(),
        key: DAYS_SHORT[dayIdx],
        fullDate: new Date(day),
      });
    }
    return week;
  }, [simulatedDate]);

  // Selected day defaults to today's day
  const [selectedDay, setSelectedDay] = useState(
    DAYS_SHORT[simulatedDate.getDay()],
  );

  // Month labels
  const timetableMonth = useMemo(
    () => `เดือน ${THAI_MONTHS[simulatedDate.getMonth()]}`,
    [simulatedDate],
  );

  // For exam mode, find the month of the earliest upcoming exam
  const examMonthLabel = useMemo(() => {
    if (exams.length === 0) return timetableMonth;
    const now = new Date(simulatedDate);
    now.setHours(0, 0, 0, 0);
    const upcoming = exams
      .map((e) => new Date(e.date + "T00:00:00"))
      .filter((d) => d >= now)
      .sort((a, b) => a - b);
    if (upcoming.length > 0) {
      return `เดือน ${THAI_MONTHS[upcoming[0].getMonth()]}`;
    }
    return timetableMonth;
  }, [exams, simulatedDate, timetableMonth]);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleAdd = () => {
    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);
    const timeRange = `${formattedStart} - ${formattedEnd}`;

    if (!newCourseName.trim()) {
      Alert.alert("Error", "กรุณากรอกชื่อวิชา");
      return;
    }

    if (!room.trim()) {
      Alert.alert("Error", "กรุณากรอกห้องเรียน");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert("Error", "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");
      return;
    }

    if (mode === "Makeup") {
      const newMakeup = {
        id: Date.now().toString(),
        code: newCourseCode || "88888888",
        name: newCourseName,
        time: timeRange,
        room: room,
        // date: formatDate(examDate), // Use examDate for specific date
        rawDate: examDate,
      };
      // We need to store full date for makeup
      const y = examDate.getFullYear();
      const m = (examDate.getMonth() + 1).toString().padStart(2, "0");
      const d = examDate.getDate().toString().padStart(2, "0");
      newMakeup.dateString = `${y}-${m}-${d}`;

      addMakeupClass(newMakeup);
      Alert.alert("สำเร็จ", "เพิ่มเรียนชดเชยเรียบร้อย");

      setModalVisible(false);
      setNewCourseName("");
      setNewCourseCode("");
      setRoom("");
      return;
    }

    if (mode === "Timetable") {
      // Add Course
      const dayCourses = courses.filter((c) => c.day === targetDay);
      if (isOverlapping(timeRange, dayCourses)) {
        Alert.alert("Conflict", "เวลานี้ซ้อนทับกับวิชาที่มีอยู่");
        return;
      }

      const newCourse = {
        id: Date.now().toString(),
        code: newCourseCode || "00000000",
        name: newCourseName,
        time: timeRange,
        room: room,
        day: targetDay,
      };
      addCourse(newCourse);
      Alert.alert("สำเร็จ", "เพิ่มวิชาเรียนเรียบร้อย");
    } else {
      // Add Exam
      // Format date to YYYY-MM-DD for storage
      const y = examDate.getFullYear();
      const m = (examDate.getMonth() + 1).toString().padStart(2, "0");
      const d = examDate.getDate().toString().padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const newExam = {
        id: Date.now(),
        subject: newCourseName,
        code: newCourseCode || "00000000",
        date: dateStr,
        time: timeRange,
        room: room,
      };
      addExam(newExam);
      Alert.alert("สำเร็จ", "เพิ่มการสอบเรียบร้อย");
    }

    setModalVisible(false);
    setNewCourseName("");
    setNewCourseCode("");
    setRoom("");
  };

  const handleSelectSubject = (course) => {
    setNewCourseName(course.name);
    setNewCourseCode(course.code);
    // setRoom(course.room || ""); // Auto-fill disabled
    setShowSubjectSelector(false);
  };

  const onChangeStart = (selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartTime(selectedDate);
      // Auto-set end time to start time + 1 hour for convenience
      const newEnd = new Date(selectedDate);
      newEnd.setHours(selectedDate.getHours() + 1);
      setEndTime(newEnd);
    }
  };

  const onChangeEnd = (selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const confirmDelete = (item, type) => {
    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบ ${type === "course" ? "วิชาเรียน" : type === "makeup" ? "เรียนชดเชย" : "การสอบ"} นี้ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: () => {
            if (type === "course") {
              deleteCourse(item.id);
            } else if (type === "makeup") {
              deleteMakeupClass(item.id);
            } else {
              deleteExam(item.id); // Ensure ID is correct type
            }
          },
        },
      ],
    );
  };

  // ---- Timetable Mode Data ----
  const todayCourses = useMemo(() => {
    // 1. Regular courses for this day of week
    const regular = courses
      .filter((c) => c.day === selectedDay)
      .map((c) => ({ ...c, type: "regular" }));

    // 2. Makeup classes for this specific date
    const y = simulatedDate.getFullYear();
    const m = (simulatedDate.getMonth() + 1).toString().padStart(2, "0");
    const d = simulatedDate.getDate().toString().padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const makeups = makeupClasses
      .filter((m) => m.dateString === dateStr)
      .map((m) => ({ ...m, type: "makeup" }));

    // Merge and sort by time
    const all = [...regular, ...makeups]
      .map((c) => {
        const timeParts = c.time.replace(/\s/g, "").split("-");
        const [h, m] = (timeParts[0] || "0:0").split(/[:.]/);
        const startMin = parseInt(h) * 60 + parseInt(m || "0");
        return { ...c, startMin };
      })
      .sort((a, b) => a.startMin - b.startMin);
    return all;
  }, [courses, makeupClasses, selectedDay, simulatedDate]);

  const nowStudying = todayCourses.find((c) => isTimeCurrent(c.time));
  const nextCourses = todayCourses.filter((c) => isTimeUpcoming(c.time));

  // ---- Exam Mode Data (from context) ----
  const examData = useMemo(() => {
    const now = new Date(simulatedDate);
    now.setHours(0, 0, 0, 0);

    return exams
      .map((exam) => {
        const examDate = new Date(exam.date + "T00:00:00");
        return {
          id: exam.id.toString(),
          code: exam.code,
          name: exam.subject,
          time: exam.time,
          room: exam.room,
          date: exam.date,
          examDate,
          accent: "#B9F6CA",
        };
      })
      .sort((a, b) => {
        // Sort by date, then by time
        if (a.examDate.getTime() !== b.examDate.getTime())
          return a.examDate - b.examDate;
        return a.time.localeCompare(b.time);
      });
  }, [exams, simulatedDate]);

  // Separate into Upcoming (including today upcoming) and Completed
  const upcomingExams = useMemo(() => {
    const now = new Date(simulatedDate);
    return examData.filter((e) => {
      // Parse start time to get specific comparable time
      const [h, m] = e.time.split("-")[0].trim().split(/[:.]/).map(Number);
      const examTime = new Date(e.examDate);
      examTime.setHours(h, m, 0, 0);
      return examTime >= now;
    });
  }, [examData, simulatedDate]);

  const completedExams = useMemo(() => {
    const now = new Date(simulatedDate);
    return examData
      .filter((e) => {
        const [h, m] = e.time.split("-")[0].trim().split(/[:.]/).map(Number);
        const examTime = new Date(e.examDate);
        examTime.setHours(h, m, 0, 0);
        return examTime < now;
      })
      .sort((a, b) => b.examDate - a.examDate); // Show recent completed first
  }, [examData, simulatedDate]);

  // Is today highlighted in calendar (for visual)
  const todayKey = DAYS_SHORT[simulatedDate.getDay()];

  // Unique subjects for selector
  const uniqueSubjects = useMemo(() => {
    const seen = new Set();
    return courses.filter((c) => {
      const duplicate = seen.has(c.code + c.name);
      seen.add(c.code + c.name);
      return !duplicate;
    });
  }, [courses]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>StudySync</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userName}>น.วรัทภพ</Text>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={16} color="#006D6D" />
          </View>
        </View>
      </View>

      {/* Toggle Segment */}
      <View style={styles.toggleWrapper}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              mode === "Timetable" && styles.activeToggle,
            ]}
            onPress={() => setMode("Timetable")}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "Timetable" && styles.activeToggleText,
              ]}
            >
              ตารางเรียน
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "Exam" && styles.activeToggle]}
            onPress={() => setMode("Exam")}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "Exam" && styles.activeToggleText,
              ]}
            >
              ตารางสอบ
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Month Label */}
      <Text style={styles.monthLabel}>
        {mode === "Timetable" ? timetableMonth : examMonthLabel}
      </Text>

      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        {calendarWeek.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.dateItem}
            onPress={() => setSelectedDay(item.key)}
          >
            <Text style={styles.dayText}>{item.short}</Text>
            <View
              style={[
                styles.dateCircle,
                selectedDay === item.key && styles.activeDateCircle,
                item.key === todayKey &&
                  selectedDay !== item.key &&
                  styles.todayDateCircle,
              ]}
            >
              <Text
                style={[
                  styles.dateNum,
                  selectedDay === item.key && styles.activeDateNum,
                ]}
              >
                {item.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mode === "Timetable" ? (
          <>
            {/* Currently Studying */}
            {nowStudying && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.dot} />
                  <Text style={styles.sectionTitle}>กำลังเรียนอยู่</Text>
                </View>

                <View style={styles.timelineRow}>
                  <View style={styles.timelineLine} />
                  <View style={styles.cardContainer}>
                    <TouchableOpacity
                      style={styles.cardContent} // Use cardContent style but wrap in Touchable
                      onLongPress={() =>
                        confirmDelete(
                          nowStudying,
                          nowStudying.type === "makeup" ? "makeup" : "course",
                        )
                      }
                    >
                      <View
                        style={[
                          styles.cardAccent,
                          {
                            backgroundColor:
                              nowStudying.type === "makeup"
                                ? "#FFF176"
                                : "#E0F2F1",
                          },
                        ]}
                      />
                      <View style={{ flex: 1, padding: 15 }}>
                        <View style={styles.cardHeader}>
                          <View style={styles.codeBadge}>
                            <Text style={styles.codeText}>
                              {nowStudying.code}
                            </Text>
                          </View>
                          <Text style={styles.timeText}>
                            {nowStudying.time} น.
                          </Text>
                        </View>
                        <Text style={styles.courseName}>
                          {nowStudying.name}
                        </Text>
                        <Text style={styles.roomText}>{nowStudying.room}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Next Subjects */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.dot} />
                <Text style={styles.sectionTitle}>วิชาถัดไป</Text>
              </View>

              {nextCourses.length > 0
                ? nextCourses.map((c, index) => (
                    <View key={c.id} style={styles.timelineRow}>
                      <View
                        style={[
                          styles.timelineLine,
                          index === nextCourses.length - 1 && {
                            backgroundColor: "transparent",
                          },
                        ]}
                      />
                      <TouchableOpacity
                        style={styles.cardContainer}
                        onLongPress={() =>
                          confirmDelete(
                            c,
                            c.type === "makeup" ? "makeup" : "course",
                          )
                        }
                      >
                        {c.type === "makeup" && (
                          <View
                            style={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              backgroundColor: "#FFF176",
                              paddingHorizontal: 5,
                              borderRadius: 4,
                            }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                              ชดเชย
                            </Text>
                          </View>
                        )}

                        <View
                          style={[
                            styles.cardAccent,
                            {
                              backgroundColor:
                                c.type === "makeup" ? "#FFF176" : "#E0F2F1",
                            },
                          ]}
                        />
                        <View style={styles.cardContent}>
                          <View style={styles.cardHeader}>
                            <View style={styles.codeBadge}>
                              <Text style={styles.codeText}>{c.code}</Text>
                            </View>
                            <Text style={styles.timeText}>{c.time} น.</Text>
                          </View>
                          <Text style={styles.courseName}>{c.name}</Text>
                          <Text style={styles.roomText}>{c.room}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))
                : !nowStudying && (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#999",
                        marginTop: 20,
                      }}
                    >
                      ไม่มีเรียนในวันนี้
                    </Text>
                  )}
            </View>
          </>
        ) : (
          // EXAM MODE - Data from AppContext
          <>
            {/* Next Exams (Upcoming) */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.dot} />
                <Text style={styles.sectionTitle}>การสอบที่กำลังจะมาถึง</Text>
              </View>

              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, index) => (
                  <View key={exam.id} style={styles.timelineRow}>
                    <View
                      style={[
                        styles.timelineLine,
                        index === upcomingExams.length - 1 && {
                          backgroundColor: "transparent",
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={styles.cardContainer}
                      onLongPress={() => confirmDelete(exam, "exam")}
                    >
                      <View
                        style={[
                          styles.cardAccent,
                          { backgroundColor: exam.accent },
                        ]}
                      />
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <View style={styles.codeBadge}>
                            <Text style={styles.codeText}>{exam.code}</Text>
                          </View>
                          <Text style={styles.timeText}>
                            {formatDate(exam.examDate)} {exam.time} น.
                          </Text>
                        </View>
                        <Text style={styles.courseName}>{exam.name}</Text>
                        <Text style={styles.roomText}>{exam.room}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    color: "#999",
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                >
                  ไม่มีการสอบที่กำลังจะมาถึง
                </Text>
              )}
            </View>

            {/* Completed Exams */}
            {completedExams.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.dot, { backgroundColor: "#999" }]} />
                  <Text style={[styles.sectionTitle, { color: "#999" }]}>
                    การสอบที่ผ่านมาแล้ว
                  </Text>
                </View>

                {completedExams.map((exam, index) => (
                  <View key={exam.id} style={styles.timelineRow}>
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: "#EEE" },
                        index === completedExams.length - 1 && {
                          backgroundColor: "transparent",
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={[styles.cardContainer, { opacity: 0.7 }]}
                      onLongPress={() => confirmDelete(exam, "exam")}
                    >
                      <View
                        style={[styles.cardAccent, { backgroundColor: "#DDD" }]}
                      />
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <View
                            style={[
                              styles.codeBadge,
                              { backgroundColor: "#EEE" },
                            ]}
                          >
                            <Text style={[styles.codeText, { color: "#888" }]}>
                              {exam.code}
                            </Text>
                          </View>
                          <Text style={styles.timeText}>
                            {formatDate(exam.examDate)} {exam.time} น.
                          </Text>
                        </View>
                        <Text style={[styles.courseName, { color: "#666" }]}>
                          {exam.name}
                        </Text>
                        <Text style={[styles.roomText, { color: "#888" }]}>
                          {exam.room}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Inline Add Button */}
        <View style={{ marginBottom: 40 }}>
          {mode === "Timetable" && (
            <TouchableOpacity
              style={[
                styles.addBtnInline,
                { backgroundColor: "#FBC02D", marginBottom: 10 },
              ]}
              onPress={() => {
                setMode("Makeup"); // Special internal mode or just state
                setModalVisible(true);
                // Reset fields handled by open
              }}
            >
              <Ionicons name="add-circle" size={24} color="#000" />
              <Text style={[styles.addBtnInlineText, { color: "#000" }]}>
                เพิ่มเรียนชดเชย
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.addBtnInline}
            onPress={() => {
              if (mode === "Makeup") setMode("Timetable"); // Reset if needed, but actually we use state to switch logic.
              // Wait, logic needs to know which button was pressed.
              // Let's control 'mode' state in the Modal or a separate state 'addType'.
              // Simpler: Just set a state 'isMakeup(true)' when yellow clicked.
              setModalVisible(true);
              setTargetDay(selectedDay);
            }}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addBtnInlineText}>
              {mode === "Timetable" ? "เพิ่มวิชาเรียน" : "เพิ่มการสอบ"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Course/Exam Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          if (mode === "Makeup") setMode("Timetable"); // Restore
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {mode === "Timetable"
                ? "เพิ่มวิชาเรียน"
                : mode === "Makeup"
                  ? "เพิ่มเรียนชดเชย"
                  : "เพิ่มการสอบ"}
            </Text>

            {mode === "Timetable" && (
              <TextInput
                style={styles.input}
                placeholder="รหัสวิชา (เช่น 01418342)"
                value={newCourseCode}
                onChangeText={setNewCourseCode}
                keyboardType="numeric"
              />
            )}

            {mode === "Makeup" ? (
              <TouchableOpacity
                style={styles.subjectSelectorBtn}
                onPress={() => setShowSubjectSelector(true)}
              >
                <Text
                  style={
                    newCourseName
                      ? styles.subjectSelectorTextSelected
                      : styles.subjectSelectorTextPlaceholder
                  }
                >
                  {newCourseName || "เลือกวิชาที่สอนชดเชย"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            ) : mode === "Exam" ? (
              <TouchableOpacity
                style={styles.subjectSelectorBtn}
                onPress={() => setShowSubjectSelector(true)}
              >
                <Text
                  style={
                    newCourseName
                      ? styles.subjectSelectorTextSelected
                      : styles.subjectSelectorTextPlaceholder
                  }
                >
                  {newCourseName
                    ? `${newCourseCode} ${newCourseName}`
                    : "เลือกวิชาที่เรียน"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="ชื่อวิชา"
                value={newCourseName}
                onChangeText={setNewCourseName}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder={
                mode === "Timetable"
                  ? "ห้องเรียน (เช่น 1205)"
                  : "ห้องสอบ (เช่น 1205)"
              }
              value={room}
              onChangeText={setRoom}
            />

            {/* Day Selector (Course Mode) */}
            {mode === "Timetable" && (
              <View style={styles.daySelectorContainer}>
                {DAYS_SHORT.map((d, index) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.daySelectBtn,
                      targetDay === d && styles.activeDaySelectBtn,
                    ]}
                    onPress={() => setTargetDay(d)}
                  >
                    <Text
                      style={[
                        styles.daySelectText,
                        targetDay === d && styles.activeDaySelectText,
                      ]}
                    >
                      {THAI_DAY_LABELS[index]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date Picker (For Exam OR Makeup) */}
            {(mode === "Exam" || mode === "Makeup") && (
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {mode === "Exam" ? "วันที่สอบ: " : "วันที่ชดเชย: "}
                  {formatDate(examDate)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#00695C" />
              </TouchableOpacity>
            )}

            <View style={styles.timePickerContainer}>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>
                  เริ่ม: {formatTime(startTime)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>
                  สิ้นสุด: {formatTime(endTime)}
                </Text>
              </TouchableOpacity>
            </View>

            <TimePickerModal
              visible={showStartPicker}
              onClose={() => setShowStartPicker(false)}
              onTimeSelected={onChangeStart}
              initialTime={startTime}
            />
            <TimePickerModal
              visible={showEndPicker}
              onClose={() => setShowEndPicker(false)}
              onTimeSelected={onChangeEnd}
              initialTime={endTime}
            />

            <DatePickerModal
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onDateSelected={setExamDate}
              initialDate={examDate}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setModalVisible(false);
                  if (mode === "Makeup") setMode("Timetable");
                }}
              >
                <Text style={styles.modalBtnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleAdd}
              >
                <Text style={styles.modalBtnConfirmText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Subject Selector Modal (Nested) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSubjectSelector}
          onRequestClose={() => setShowSubjectSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.selectorModalContainer}>
              <Text style={styles.selectorTitle}>เลือกวิชา</Text>
              <ScrollView style={{ maxHeight: 300, width: "100%" }}>
                {uniqueSubjects.map((subject, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.subjectItem}
                    onPress={() => handleSelectSubject(subject)}
                  >
                    <Text style={styles.subjectCode}>{subject.code}</Text>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeSelectorBtn}
                onPress={() => setShowSubjectSelector(false)}
              >
                <Text style={styles.closeSelectorText}>ปิด</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#006D6D",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    color: "#006D6D",
    marginRight: 8,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#B2DFDB",
  },
  toggleWrapper: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: "#00695C",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00695C",
  },
  activeToggleText: {
    color: "#fff",
  },
  monthLabel: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateItem: {
    alignItems: "center",
  },
  dayText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
    fontWeight: "bold",
  },
  dateCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  activeDateCircle: {
    backgroundColor: "#CFD8DC",
  },
  todayDateCircle: {
    backgroundColor: "#E0F2F1",
  },
  dateNum: {
    fontSize: 14,
    color: "#333",
  },
  activeDateNum: {
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#78909C",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 120,
  },
  timelineLine: {
    width: 2,
    backgroundColor: "#CFD8DC",
    marginLeft: 4,
    marginRight: 15,
  },
  cardContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardAccent: {
    width: 15,
    backgroundColor: "#B9F6CA",
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: "#D1C4E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  roomText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#00695C",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
  },
  input: {
    height: 45,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    borderRadius: 10,
    fontSize: 16,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
    gap: 10,
  },
  timeButton: {
    backgroundColor: "#E0F2F1",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  timeButtonText: {
    color: "#00695C",
    fontWeight: "bold",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#F0F0F0",
  },
  modalBtnCancelText: {
    color: "#666",
    fontWeight: "bold",
  },
  modalBtnConfirm: {
    backgroundColor: "#00695C",
  },
  modalBtnConfirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
  daySelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  daySelectBtn: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeDaySelectBtn: {
    backgroundColor: "#00695C",
    borderColor: "#00695C",
  },
  daySelectText: {
    fontSize: 12,
    color: "#666",
  },
  activeDaySelectText: {
    color: "#fff",
    fontWeight: "bold",
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E0F2F1",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: "#00695C",
    fontWeight: "bold",
  },
  subjectSelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    height: 45,
  },
  subjectSelectorTextPlaceholder: {
    color: "#999",
    fontSize: 16,
  },
  subjectSelectorTextSelected: {
    color: "#000",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorModalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    maxHeight: "60%",
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  subjectItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  subjectCode: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  closeSelectorBtn: {
    marginTop: 15,
    padding: 10,
  },
  closeSelectorText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
  addBtnInline: {
    flexDirection: "row",
    backgroundColor: "#00695C",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 40,
    padding: 15,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addBtnInlineText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default Timetable;
