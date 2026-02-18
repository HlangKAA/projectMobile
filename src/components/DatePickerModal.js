import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

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

const DatePickerModal = ({ visible, onClose, onDateSelected, initialDate }) => {
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 10 }, (_, i) => (2024 + i).toString());

  const [selectedDay, setSelectedDay] = useState("1");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState("2024");

  useEffect(() => {
    if (visible && initialDate) {
      setSelectedDay(initialDate.getDate().toString());
      setSelectedMonthIndex(initialDate.getMonth());
      setSelectedYear(initialDate.getFullYear().toString());
    }
  }, [visible, initialDate]);

  const handleConfirm = () => {
    // Note: Month is 0-indexed in Date constructor
    const date = new Date(
      parseInt(selectedYear),
      selectedMonthIndex,
      parseInt(selectedDay),
    );
    onDateSelected(date);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>เลือกวันที่</Text>

          <View style={styles.pickerContainer}>
            {/* Day */}
            <View style={styles.column}>
              <Text style={styles.columnHeader}>วัน</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
              >
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.item,
                      selectedDay === day && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedDay === day && styles.selectedItemText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month */}
            <View style={[styles.column, { flex: 2 }]}>
              <Text style={styles.columnHeader}>เดือน</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
              >
                {THAI_MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.item,
                      selectedMonthIndex === index && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedMonthIndex(index)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedMonthIndex === index && styles.selectedItemText,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year */}
            <View style={styles.column}>
              <Text style={styles.columnHeader}>ปี</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.item,
                      selectedYear === year && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedYear === year && styles.selectedItemText,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>ตกลง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    maxHeight: "60%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    height: 200,
    width: "100%",
    marginBottom: 20,
  },
  column: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    marginHorizontal: 2,
  },
  columnHeader: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#666",
    fontSize: 12,
  },
  scrollList: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  item: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedItem: {
    backgroundColor: "#E0F2F1",
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedItemText: {
    color: "#00695C",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#00695C",
    borderRadius: 10,
    marginLeft: 10,
  },
  cancelText: {
    color: "#666",
    fontWeight: "bold",
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default DatePickerModal;
