import React, { useState } from "react";
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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TimePickerModal from "../components/TimePickerModal";
import { isOverlapping } from "../utils/timeUtils";
// import ExamCard from '../components/ExamCard'; // Not used in this specific design

const Timetable = () => {
  const [selectedDay, setSelectedDay] = useState("Wed");
  const [mode, setMode] = useState("Exam"); // Default to Exam for this view

  const [courses, setCourses] = useState([
    {
      id: "0",
      code: "03751111",
      name: "Man and Environment",
      time: "09:00 - 12:00", // Normalized format for easier parsing
      room: "KH80 - 207",
      day: "Wed",
      type: "studying", // To distinguish in UI if needed
    },
    {
      id: "1",
      code: "01418342",
      name: "Mobile Application Design and Development",
      time: "16:00 - 18:00",
      room: "SC 9 - 330",
      day: "Wed",
      type: "next",
    },
    {
      id: "2",
      code: "01418342",
      name: "Mobile Application Design and Development",
      time: "18:00 - 20:00",
      room: "SC 9 - 330",
      day: "Wed",
      type: "next",
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  // Time Picker State
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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
      Alert.alert("Error", "Please fill in course name");
      return;
    }

    // Basic validation: Start < End
    if (startTime >= endTime) {
      Alert.alert("Error", "Start time must be before end time");
      return;
    }

    // Check for conflicts
    const dayCourses = courses.filter((c) => c.day === selectedDay);

    if (isOverlapping(timeRange, dayCourses)) {
      Alert.alert(
        "Conflict Detected",
        "This time slot overlaps with an existing course.",
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
      type: "next",
    };

    setCourses([...courses, newCourse]);
    setModalVisible(false);
    setNewCourseName("");
    // Reset times if needed, or keep last used
    Alert.alert("Success", "Course added successfully");
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

  // Derived state for UI rendering
  const nowStudying = courses.find(
    (c) => c.type === "studying" && c.day === selectedDay,
  );
  const nextCourses = courses.filter(
    (c) => c.type === "next" && c.day === selectedDay,
  );

  // Mock Exam Data matching the image
  const currentExams = [
    {
      id: "1",
      code: "01418322",
      name: "Introduction to Data Science",
      time: "17:00 น. - 20:00 น.",
      room: "SC 9 - 402",
      accent: "#B9F6CA", // Greenish
    },
  ];

  const nextExams = [
    {
      id: "2",
      code: "01418342",
      name: "Mobile Application Design and Development",
      time: "13:00 น. - 16:00 น.",
      room: "SC 9 - 330",
      accent: "#B9F6CA",
    },
    {
      id: "3",
      code: "02999044",
      name: "Sufficiency Economy for Living",
      time: "09:00 น. - 11:00 น.",
      room: "LH 2 - 206",
      accent: "#FFCC80", // Orange/Yellowish
    },
  ];

  // Calendar Strip Data
  const calendarDays = [
    { short: "จ.", date: "16", key: "Mon" },
    { short: "อ.", date: "17", key: "Tue" },
    { short: "พ.", date: "18", key: "Wed" },
    { short: "พฤ.", date: "19", key: "Thu" },
    { short: "ศ.", date: "20", key: "Fri" },
    { short: "ส.", date: "21", key: "Sat" },
    { short: "อา.", date: "22", key: "Sun" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>StudySync</Text>
        <Text style={styles.userName}>น.วรัทภพ</Text>
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

          {/* Add Course Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Add New Course</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Course Name"
                  value={newCourseName}
                  onChangeText={setNewCourseName}
                />
                <View style={styles.timePickerContainer}>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    style={styles.timeButton}
                  >
                    <Text style={styles.timeButtonText}>
                      Start: {formatTime(startTime)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    style={styles.timeButton}
                  >
                    <Text style={styles.timeButtonText}>
                      End: {formatTime(endTime)}
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
                  <Button
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                    color="#666"
                  />
                  <View style={{ width: 10 }} />
                  <Button
                    title="Add"
                    onPress={handleAddCourse}
                    color="#00695C"
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>

      {/* Month Label */}
      <Text style={styles.monthLabel}>
        {mode === "Timetable" ? "เดือน กุมภาพันธ์" : "เดือน มีนาคม"}
      </Text>

      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        {calendarDays.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.dateItem,
              selectedDay === item.key && styles.activeDateItem,
            ]}
            onPress={() => setSelectedDay(item.key)}
          >
            <Text style={styles.dayText}>{item.short}</Text>
            <View
              style={[
                styles.dateCircle,
                selectedDay === item.key && styles.activeDateCircle,
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

              {nextCourses.length > 0 ? (
                nextCourses.map((course, index) => (
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
                          <Text style={styles.timeText}>{course.time} น.</Text>
                        </View>
                        <Text style={styles.courseName}>{course.name}</Text>
                        <Text style={styles.roomText}>{course.room}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text
                  style={{ textAlign: "center", color: "#999", marginTop: 20 }}
                >
                  ไม่มีเรียนช่วงนี้
                </Text>
              )}
            </View>
          </>
        ) : (
          // EXAM MODE
          <>
            {/* Currently Examining */}
            {selectedDay === "Wed" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.dot} />
                  <Text style={styles.sectionTitle}>กำลังสอบอยู่</Text>
                </View>

                {currentExams.map((exam) => (
                  <View key={exam.id} style={styles.timelineRow}>
                    <View style={styles.timelineLine} />
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
                          <Text style={styles.timeText}>{exam.time}</Text>
                        </View>
                        <Text style={styles.courseName}>{exam.name}</Text>
                        <Text style={styles.roomText}>{exam.room}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Next Exams */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.dot} />
                <Text style={styles.sectionTitle}>วิชาถัดไป</Text>
              </View>

              {selectedDay === "Wed" &&
                nextExams.map((exam, index) => (
                  <View key={exam.id} style={styles.timelineRow}>
                    <View
                      style={[
                        styles.timelineLine,
                        index === nextExams.length - 1 && {
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
                          <Text style={styles.timeText}>{exam.time}</Text>
                        </View>
                        <Text style={styles.courseName}>{exam.name}</Text>
                        <Text style={styles.roomText}>{exam.room}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              {selectedDay !== "Wed" && (
                <Text
                  style={{ textAlign: "center", color: "#999", marginTop: 20 }}
                >
                  ไม่มีการสอบช่วงนี้ (Mock Data for Wed)
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
  userName: {
    fontSize: 16,
    color: "#006D6D",
  },
  toggleWrapper: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5", // Lighter background for toggle track
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
    backgroundColor: "#00695C", // Dark Teal
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
    backgroundColor: "#CFD8DC", // Grey Circle for selected date
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
    backgroundColor: "#78909C", // BlueGrey
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 120, // Taller cards
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
    backgroundColor: "#B9F6CA", // Default Greenish
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
    backgroundColor: "#D1C4E9", // Light Purple
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
    alignSelf: "center", // Center FAB
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
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    borderRadius: 5,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  timeButton: {
    backgroundColor: "#E0F2F1",
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
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
    marginTop: 10,
  },
});

export default Timetable;
