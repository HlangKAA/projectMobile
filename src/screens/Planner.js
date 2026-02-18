import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Button,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TimePickerModal from "../components/TimePickerModal";
import { isOverlapping } from "../utils/timeUtils";

const Planner = () => {
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

  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "ปิงปอง",
      time: "16.30-18.30",
      icon: "tennisball-outline",
      color: "#EF5350",
    }, // Red-ish
    {
      id: 2,
      name: "ฟุตบอล",
      time: "19.30-20.30",
      icon: "football-outline",
      color: "#424242",
    }, // Dark
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");

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

  const handleAddActivity = () => {
    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);
    const timeRange = `${formattedStart}-${formattedEnd}`;

    if (!newActivityName) {
      Alert.alert("Error", "Please fill in activity name");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert("Error", "Start time must be before end time");
      return;
    }

    if (isOverlapping(timeRange, activities)) {
      Alert.alert(
        "Conflict Detected",
        "This time slot overlaps with an existing activity.",
      );
      return;
    }

    const newActivity = {
      id: Date.now(),
      name: newActivityName,
      time: timeRange,
      icon: "ellipse-outline", // Default icon
      color: "#78909C", // Default color
    };

    setActivities([...activities, newActivity]);
    setModalVisible(false);
    setNewActivityName("");
    Alert.alert("Success", "Activity added successfully");
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

  const toggleTask = (id) => {
    setStudyPlan(
      studyPlan.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>แผนการอ่านหนังสือ</Text>
        <TouchableOpacity>
          <Text style={styles.addText}>+ เพิ่มงาน</Text>
        </TouchableOpacity>
      </View>

      {/* Study Plan List */}
      <View style={styles.section}>
        {studyPlan.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => toggleTask(task.id)}
          >
            <Ionicons
              name={task.completed ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={task.completed ? "#006D6D" : "#CCC"}
            />
            <Text
              style={[styles.taskText, task.completed && styles.taskCompleted]}
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
                  size={30}
                  color={activity.color}
                />
              </View>
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Activity Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add New Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Activity Name"
              value={newActivityName}
              onChangeText={setNewActivityName}
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
              <Button title="Add" onPress={handleAddActivity} color="#00695C" />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  addText: {
    fontSize: 16,
    color: "#006D6D",
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  taskText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: "48%",
    backgroundColor: "#E3E8EF", // Light gray/blue
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: "center", // Centered content as per design
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "flex-start", // Icon actually looks left-aligned in typical cards, but let's center for now or match design if I recall key UX. The screenshot had left aligned icon in a box.
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  activityTime: {
    fontSize: 14,
    color: "#666",
    alignSelf: "flex-start",
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#006D6D",
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

export default Planner;
