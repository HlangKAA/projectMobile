import React, { useState, useContext, useMemo } from "react";
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
  const { courses, addCourse, exams, simulatedDate } = useContext(AppContext);

  const [mode, setMode] = useState("Timetable");
  const [modalVisible, setModalVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  // Time Picker State
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

  const handleAddCourse = () => {
    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);
    const timeRange = `${formattedStart} - ${formattedEnd}`;

    if (!newCourseName) {
      Alert.alert("Error", "กรุณากรอกชื่อวิชา");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert("Error", "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");
      return;
    }

    // Check for conflicts
    const dayCourses = courses.filter((c) => c.day === selectedDay);

    if (isOverlapping(timeRange, dayCourses)) {
      Alert.alert(
        "Conflict Detected",
        "ช่วงเวลานี้ซ้อนทับกับวิชาที่มีอยู่แล้ว",
      );
      return;
    }

    const newCourse = {
      id: Date.now().toString(),
      code: "99999999",
      name: newCourseName,
      time: timeRange,
      room: "TBA",
      day: selectedDay,
    };

    addCourse(newCourse);
    setModalVisible(false);
    setNewCourseName("");
    Alert.alert("สำเร็จ", "เพิ่มวิชาเรียบร้อยแล้ว");
  };

  const onChangeStart = (selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const onChangeEnd = (selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  // ---- Timetable Mode Data ----
  const todayCourses = useMemo(() => {
    return courses
      .filter((c) => c.day === selectedDay)
      .map((c) => {
        const timeParts = c.time.replace(/\s/g, "").split("-");
        const [h, m] = (timeParts[0] || "0:0").split(/[:.]/);
        const startMin = parseInt(h) * 60 + parseInt(m || "0");
        return { ...c, startMin };
      })
      .sort((a, b) => a.startMin - b.startMin);
  }, [courses, selectedDay]);

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

  // Split exams into "currently happening" (first one) and "upcoming" (rest)
  const currentExam = examData.length > 0 ? examData[0] : null;
  const upcomingExams = examData.length > 1 ? examData.slice(1) : [];

  // Is today highlighted in calendar (for visual)
  const todayKey = DAYS_SHORT[simulatedDate.getDay()];

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
                    <View style={styles.cardAccent} />
                    <View style={styles.cardContent}>
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
                      <Text style={styles.courseName}>{nowStudying.name}</Text>
                      <Text style={styles.roomText}>{nowStudying.room}</Text>
                    </View>
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
                ? nextCourses.map((course, index) => (
                    <View key={course.id} style={styles.timelineRow}>
                      <View
                        style={[
                          styles.timelineLine,
                          index === nextCourses.length - 1 && {
                            backgroundColor: "transparent",
                          },
                        ]}
                      />
                      <View style={styles.cardContainer}>
                        <View style={styles.cardAccent} />
                        <View style={styles.cardContent}>
                          <View style={styles.cardHeader}>
                            <View style={styles.codeBadge}>
                              <Text style={styles.codeText}>{course.code}</Text>
                            </View>
                            <Text style={styles.timeText}>
                              {course.time} น.
                            </Text>
                          </View>
                          <Text style={styles.courseName}>{course.name}</Text>
                          <Text style={styles.roomText}>{course.room}</Text>
                        </View>
                      </View>
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
            {/* Currently Examining */}
            {currentExam && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.dot} />
                  <Text style={styles.sectionTitle}>กำลังสอบอยู่</Text>
                </View>

                <View style={styles.timelineRow}>
                  <View style={styles.timelineLine} />
                  <View style={styles.cardContainer}>
                    <View
                      style={[
                        styles.cardAccent,
                        { backgroundColor: currentExam.accent },
                      ]}
                    />
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeText}>
                            {currentExam.code}
                          </Text>
                        </View>
                        <Text style={styles.timeText}>
                          {currentExam.time} น.
                        </Text>
                      </View>
                      <Text style={styles.courseName}>{currentExam.name}</Text>
                      <Text style={styles.roomText}>{currentExam.room}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Next Exams */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.dot} />
                <Text style={styles.sectionTitle}>วิชาถัดไป</Text>
              </View>

              {upcomingExams.length > 0
                ? upcomingExams.map((exam, index) => (
                    <View key={exam.id} style={styles.timelineRow}>
                      <View
                        style={[
                          styles.timelineLine,
                          index === upcomingExams.length - 1 && {
                            backgroundColor: "transparent",
                          },
                        ]}
                      />
                      <View style={styles.cardContainer}>
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
                            <Text style={styles.timeText}>{exam.time} น.</Text>
                          </View>
                          <Text style={styles.courseName}>{exam.name}</Text>
                          <Text style={styles.roomText}>{exam.room}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                : !currentExam && (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#999",
                        marginTop: 20,
                      }}
                    >
                      ไม่มีการสอบ
                    </Text>
                  )}
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Course Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>เพิ่มวิชาเรียน</Text>
            <TextInput
              style={styles.input}
              placeholder="ชื่อวิชา"
              value={newCourseName}
              onChangeText={setNewCourseName}
            />
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
            />
            <TimePickerModal
              visible={showEndPicker}
              onClose={() => setShowEndPicker(false)}
              onTimeSelected={onChangeEnd}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleAddCourse}
              >
                <Text style={styles.modalBtnConfirmText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
});

export default Timetable;
