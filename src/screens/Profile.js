import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { AppContext } from "../context/AppContext";
import TimePickerModal from "../components/TimePickerModal";
import { uploadImageToCloudinary } from "../config/cloudinary";
import { db } from "../config/firebase";

const Profile = () => {
  const { simulatedDate, setSimulatedDate, resetAll, userProfile, logout } =
    useContext(AppContext);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Date picker state
  const [tempDay, setTempDay] = useState(simulatedDate.getDate().toString());
  const [tempMonth, setTempMonth] = useState(
    (simulatedDate.getMonth() + 1).toString(),
  );
  const [tempYear, setTempYear] = useState(
    simulatedDate.getFullYear().toString(),
  );

  const handleClearData = () => {
    Alert.alert(
      "ล้างข้อมูลทั้งหมด",
      "คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบข้อมูล",
          onPress: async () => {
            await resetAll();
            Alert.alert("สำเร็จ", "ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว");
          },
          style: "destructive",
        },
      ],
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ขออภัย", "ต้องการสิทธิ์เข้าถึงคลังภาพ");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploadingImage(true);
      try {
        const url = await uploadImageToCloudinary(uri);
        setProfileImage(url);
        if (userProfile?.uid) {
          await updateDoc(doc(db, "users", userProfile.uid), {
            profileUrl: url,
          });
        }
        Alert.alert("สำเร็จ", "อัปโหลดรูปโปรไฟล์เรียบร้อย!");
      } catch (err) {
        // If Cloudinary fails (e.g. no preset set up), just show local preview
        setProfileImage(uri);
        console.warn("Cloudinary upload failed, using local URI:", err.message);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSetDate = () => {
    const day = parseInt(tempDay);
    const month = parseInt(tempMonth);
    const year = parseInt(tempYear);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      Alert.alert("Error", "กรุณากรอกตัวเลขที่ถูกต้อง");
      return;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      Alert.alert("Error", "วันที่ไม่ถูกต้อง");
      return;
    }

    // Keep current hours/minutes from simulatedDate
    const newDate = new Date(
      year,
      month - 1,
      day,
      simulatedDate.getHours(),
      simulatedDate.getMinutes(),
    );
    setSimulatedDate(newDate);
    setShowDateModal(false);
    Alert.alert("สำเร็จ", `ตั้งวันที่จำลองเป็น ${day}/${month}/${year}`);
  };

  const handleTimeSelected = (selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(simulatedDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setSimulatedDate(newDate);
      const hh = selectedTime.getHours().toString().padStart(2, "0");
      const mm = selectedTime.getMinutes().toString().padStart(2, "0");
      Alert.alert("สำเร็จ", `ตั้งเวลาจำลองเป็น ${hh}:${mm}`);
    }
  };

  const formatCurrentDate = () => {
    const d = simulatedDate;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const formatCurrentTime = () => {
    const d = simulatedDate;
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log("Back")}>
          <Ionicons name="arrow-back" size={24} color="#006D6D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>โปรไฟล์</Text>
        <TouchableOpacity onPress={() => console.log("Menu")}>
          <Ionicons name="ellipsis-vertical" size={24} color="#006D6D" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {profileImage || userProfile?.profileUrl ? (
            <Image
              source={{ uri: profileImage || userProfile?.profileUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#006D6D" />
            </View>
          )}
          <TouchableOpacity
            style={styles.changePhotoBtn}
            onPress={handlePickImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>
          {userProfile
            ? userProfile.firstName || "ผู้ใช้งานใหม่"
            : "กำลังโหลด..."}{" "}
          {userProfile?.lastName || ""}
        </Text>
        <Text style={styles.subText}>
          {userProfile?.faculty || "ไม่ระบุคณะ"}
        </Text>
        <Text style={styles.subText}>
          สาขา {userProfile?.major || "ไม่ระบุ"}
        </Text>
      </View>

      {/* Testing: Simulated Date & Time */}
      <Text style={styles.sectionTitle}>การทดสอบ</Text>
      <View style={styles.settingsGroup}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowDateModal(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="calendar-outline" size={22} color="#00695C" />
            <Text style={styles.settingText}>วันที่จำลอง</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.testingValue}>{formatCurrentDate()}</Text>
            <Ionicons name="chevron-forward" size={20} color="#00695C" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomWidth: 0 }]}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="time-outline" size={22} color="#00695C" />
            <Text style={styles.settingText}>เวลาจำลอง</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.testingValue}>{formatCurrentTime()}</Text>
            <Ionicons name="chevron-forward" size={20} color="#00695C" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#00695C"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </TouchableOpacity>

      {/* Clear Data */}
      <TouchableOpacity style={styles.clearBtn} onPress={handleClearData}>
        <Ionicons
          name="trash"
          size={20}
          color="red"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.clearText}>ล้างข้อมูลทั้งหมด</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />

      {/* Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDateModal}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>ตั้งวันที่จำลอง</Text>
            <Text style={styles.modalSubtitle}>
              เปลี่ยนวันที่เพื่อทดสอบ Dashboard
            </Text>

            <View style={styles.dateInputRow}>
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>วัน</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempDay}
                  onChangeText={setTempDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>เดือน</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempMonth}
                  onChangeText={setTempMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>ปี (ค.ศ.)</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempYear}
                  onChangeText={setTempYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleSetDate}
              >
                <Text style={styles.modalBtnConfirmText}>ตั้งค่า</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal (reusing existing component) */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onTimeSelected={handleTimeSelected}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#B2DFDB",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#B2DFDB",
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00695C",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  editProfileBtn: {
    marginTop: 15,
    backgroundColor: "#00695C",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statVal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  settingsGroup: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 15,
    fontSize: 14,
    color: "#333",
  },
  testingValue: {
    color: "#00695C",
    marginRight: 5,
    fontWeight: "bold",
  },
  clearBtn: {
    flexDirection: "row",
    backgroundColor: "#FFE5E5",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  clearText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#E0F2F1",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#B2DFDB",
  },
  logoutText: {
    color: "#00695C",
    fontWeight: "bold",
    fontSize: 16,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },
  dateInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  dateInputGroup: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  dateInputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    textAlign: "center",
    width: "100%",
    fontWeight: "bold",
    color: "#00695C",
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

export default Profile;
