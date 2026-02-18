import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

const TimePickerModal = ({ visible, onClose, onTimeSelected }) => {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const handleConfirm = () => {
    const date = new Date();
    date.setHours(parseInt(selectedHour));
    date.setMinutes(parseInt(selectedMinute));
    onTimeSelected(date);
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
          <Text style={styles.title}>Select Time</Text>

          <View style={styles.pickerContainer}>
            {/* Hours */}
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Hour</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
              >
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.item,
                      selectedHour === hour && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedHour === hour && styles.selectedItemText,
                      ]}
                    >
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.separator}>:</Text>

            {/* Minutes */}
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Minute</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
              >
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.item,
                      selectedMinute === minute && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedMinute === minute && styles.selectedItemText,
                      ]}
                    >
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>Confirm</Text>
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    width: "100%",
  },
  column: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  columnHeader: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#666",
  },
  scrollList: {
    width: "100%",
  },
  item: {
    paddingVertical: 10,
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#E0F2F1",
    borderRadius: 10,
    width: "80%",
  },
  itemText: {
    fontSize: 18,
    color: "#333",
  },
  selectedItemText: {
    color: "#00695C",
    fontWeight: "bold",
  },
  separator: {
    fontSize: 30,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
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

export default TimePickerModal;
