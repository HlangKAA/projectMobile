import React, { useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TimePickerModal from "../components/TimePickerModal";
import { AppContext } from "../context/AppContext";
import { isOverlapping } from "../utils/timeUtils";

const THAI_DAYS = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];
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

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const THAI_DAY_LABELS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

const Planner = () => {
  const {
    activities,
    addActivity,
    studyPlan,
    toggleStudyPlanItem,
    addStudyTask,
    clearStudyPlan,
    simulatedDate,
  } = useContext(AppContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [selectedDay, setSelectedDay] = useState("Mon");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Time Picker State
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Study Plan Add Task Modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Formatted date header
  const formattedDate = useMemo(() => {
    const d = simulatedDate;
    const buddhistYear = d.getFullYear() + 543;
    return `${THAI_DAYS[d.getDay()]} ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${buddhistYear}`;
  }, [simulatedDate]);

  // Progress
  const completedTasks = studyPlan.filter((t) => t.completed).length;
  const totalTasks = studyPlan.length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleAddActivity = () => {
    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);
    const timeRange = `${formattedStart}-${formattedEnd}`;

    if (!newActivityName) {
      Alert.alert("Error", "กรุณากรอกชื่อกิจกรรม");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert("Error", "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");
      return;
    }

    const dayActivities = activities.filter((a) => a.day === selectedDay);

    if (isOverlapping(timeRange, dayActivities)) {
      Alert.alert(
        "Conflict Detected",
        "ช่วงเวลานี้ซ้อนทับกับกิจกรรมที่มีอยู่แล้ว",
      );
      return;
    }

    const newActivity = {
      id: Date.now(),
      name: newActivityName,
      time: timeRange,
      day: selectedDay,
      icon: "ellipse-outline",
      color: "#78909C",
    };

    addActivity(newActivity);
    setModalVisible(false);
    setNewActivityName("");
    Alert.alert("สำเร็จ", "เพิ่มกิจกรรมเรียบร้อยแล้ว");
  };

  const onChangeStart = (selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) setStartTime(selectedDate);
  };

  const onChangeEnd = (selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) setEndTime(selectedDate);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with date and greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.greeting}>สวัสดี วรัทภพ</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color="#B8860B" />
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.section}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>ความคืบหน้าประจำวัน</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              คุณทำเป้าหมายการเรียนสำเร็จไปแล้ว {progressPercent}% ในวันนี้
              {progressPercent < 100 ? "\nพยายามต่อไปนะ" : "\nเยี่ยมมาก!"}
            </Text>
          </View>
        </View>

        {/* Study Plan Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>แผนการทำงาน</Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={clearStudyPlan}
                style={{ marginRight: 15 }}
              >
                <Text style={[styles.addText, { color: "#D32F2F" }]}>
                  ล้างทั้งหมด
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddTaskModal(true)}>
                <Text style={styles.addText}>+ เพิ่มงาน</Text>
              </TouchableOpacity>
            </View>
          </View>

          {studyPlan.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => toggleStudyPlanItem(task.id)}
            >
              <Ionicons
                name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={task.completed ? "#006D6D" : "#CCC"}
              />
              <Text
                style={[
                  styles.taskText,
                  task.completed && styles.taskCompleted,
                ]}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>กิจกรรมนอกหลักสูตร</Text>
          <View style={styles.activitiesContainer}>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: activity.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={activity.icon}
                    size={28}
                    color={activity.color}
                  />
                </View>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Inline Add Activity Button (replacing FAB) */}
      <View style={{ paddingBottom: 20 }}>
        <TouchableOpacity
          style={styles.addBtnInline}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addBtnInlineText}>เพิ่มกิจกรรม</Text>
        </TouchableOpacity>
      </View>

      {/* Add Activity Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>เพิ่มกิจกรรม</Text>
            <TextInput
              style={styles.input}
              placeholder="ชื่อกิจกรรม"
              value={newActivityName}
              onChangeText={setNewActivityName}
            />

            <Text style={styles.label}>เลือกวัน:</Text>
            <View style={styles.daySelectorContainer}>
              {DAYS_SHORT.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.daySelectBtn,
                    selectedDay === day && styles.activeDaySelectBtn,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text
                    style={[
                      styles.daySelectText,
                      selectedDay === day && styles.activeDaySelectText,
                    ]}
                  >
                    {THAI_DAY_LABELS[index]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleAddActivity}
              >
                <Text style={styles.modalBtnConfirmText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddTaskModal}
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>เพิ่มงาน</Text>
            <TextInput
              style={styles.input}
              placeholder="ชื่องาน เช่น เขียนสรุปวิชา..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setShowAddTaskModal(false);
                  setNewTaskTitle("");
                }}
              >
                <Text style={styles.modalBtnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => {
                  if (!newTaskTitle.trim()) {
                    Alert.alert("Error", "กรุณากรอกชื่องาน");
                    return;
                  }
                  addStudyTask(newTaskTitle.trim());
                  Alert.alert("สำเร็จ", "เพิ่มงานเรียบร้อยแล้ว");
                  setShowAddTaskModal(false);
                  setNewTaskTitle("");
                }}
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
  wrapper: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FDEBD0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F5CBA7",
  },
  /* Section */
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  addText: {
    fontSize: 14,
    color: "#006D6D",
    fontWeight: "bold",
  },
  /* Progress Card */
  progressCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: {
    color: "#00695C",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressPercent: {
    color: "#00695C",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#C8E6C9",
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#00695C",
    borderRadius: 5,
  },
  progressSubtext: {
    color: "#2E7D32",
    fontSize: 12,
    lineHeight: 18,
  },
  /* Task Card */
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  taskText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  /* Activities */
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: "48%",
    backgroundColor: "#E0F2F1",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 14,
    color: "#666",
  },
  /* FAB */
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
  /* Modal */
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
  label: {
    alignSelf: "flex-start",
    marginBottom: 8,
    fontWeight: "bold",
    color: "#333",
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
  modalBtnRow: {
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
  addBtnInline: {
    flexDirection: "row",
    backgroundColor: "#00695C",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
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

export default Planner;
