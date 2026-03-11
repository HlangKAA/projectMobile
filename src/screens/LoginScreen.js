import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { AppContext } from "../context/AppContext";

const LoginScreen = ({ navigation }) => {
  const { setUserProfile } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const faculties = [
    "คณะเกษตร กำแพงแสน",
    "คณะวิศวกรรมศาสตร์ กำแพงแสน",
    "คณะศิลปศาสตร์และวิทยาศาสตร์",
    "คณะศึกษาศาสตร์และพัฒนศาสตร์",
    "คณะสัตวแพทยศาสตร์",
    "คณะวิทยาศาสตร์การกีฬาและสุขภาพ",
    "คณะอุตสาหกรรมบริการ",
    "คณะประมง",
    "คณะสิ่งแวดล้อม",
  ];
  const [faculty, setFaculty] = useState(faculties[0]);

  const [major, setMajor] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    if (isRegister) {
      if (password !== confirmPassword) {
        Alert.alert("รหัสผ่านไม่ตรงกัน", "กรุณายืนยันรหัสผ่านให้ถูกต้อง");
        return;
      }
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !faculty.trim() ||
        !major.trim()
      ) {
        Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน");
        return;
      }
    }
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        const newProfile = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          faculty: faculty.trim(),
          major: major.trim(),
          email: email.trim(),
        };
        // Save extra user data to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), newProfile);

        // Update Context UI immediately
        setUserProfile({ uid: userCredential.user.uid, ...newProfile });

        Alert.alert("สำเร็จ", "สร้างบัญชีเรียบร้อยแล้ว!");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      const messages = {
        "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
        "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
        "auth/user-not-found": "ไม่พบบัญชีนี้ในระบบ",
        "auth/email-already-in-use": "อีเมลนี้ถูกใช้แล้ว",
        "auth/weak-password": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      };
      Alert.alert("ล้มเหลว", messages[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <Ionicons name="book" size={40} color="#00695C" />
        </View>

        <Text style={styles.appName}>StudySync</Text>
        <Text style={styles.tagline}>Academic Life Planner</Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.label}>อีเมล</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#90A4AE"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#B0BEC5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>รหัสผ่าน</Text>
          </View>
          <View style={styles.inputRow}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#90A4AE"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#B0BEC5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#90A4AE"
              />
            </TouchableOpacity>
          </View>

          {isRegister && (
            <>
              {/* Confirm Password */}
              <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#90A4AE"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#B0BEC5"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#90A4AE"
                  />
                </TouchableOpacity>
              </View>

              {/* Personal Info */}
              <Text style={styles.label}>ชื่อ - นามสกุล</Text>
              <View style={styles.nameRow}>
                <View style={[styles.inputRow, { flex: 1, marginRight: 10 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="ชื่อ"
                    placeholderTextColor="#B0BEC5"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={[styles.inputRow, { flex: 1 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="นามสกุล"
                    placeholderTextColor="#B0BEC5"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <Text style={styles.label}>คณะ และ สาขา</Text>
              <View style={[styles.inputRow, { paddingVertical: 0 }]}>
                <Ionicons
                  name="school-outline"
                  size={18}
                  color="#90A4AE"
                  style={styles.inputIcon}
                />
                <View style={{ flex: 1 }}>
                  <Picker
                    selectedValue={faculty}
                    onValueChange={(itemValue) => setFaculty(itemValue)}
                    style={{ color: "#263238" }}
                    dropdownIconColor="#90A4AE"
                  >
                    {faculties.map((f, i) => (
                      <Picker.Item key={i} label={f} value={f} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.inputRow}>
                <Ionicons
                  name="library-outline"
                  size={18}
                  color="#90A4AE"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="สาขา เช่น วิศวกรรมคอมพิวเตอร์"
                  placeholderTextColor="#B0BEC5"
                  value={major}
                  onChangeText={setMajor}
                />
              </View>
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>
                {isRegister ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login / Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>
              {isRegister ? "มีบัญชีแล้ว? " : "ยังไม่มีบัญชี? "}
            </Text>
            <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
              <Text style={styles.registerLink}>
                {isRegister ? "เข้าสู่ระบบ" : "สร้างบัญชีใหม่"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F7F7",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  /* Logo */
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#B2DFDB",
  },
  appName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#004D40",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#80CBC4",
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  /* Card */
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    shadowColor: "#00695C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#37474F",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#CFD8DC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#263238",
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotText: {
    fontSize: 13,
    color: "#00695C",
    fontWeight: "bold",
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  /* Remember Me */
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#90A4AE",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#00695C",
    borderColor: "#00695C",
  },
  rememberText: {
    fontSize: 14,
    color: "#546E7A",
  },
  /* Login Button */
  loginBtn: {
    backgroundColor: "#00695C",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#00695C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  /* Register row */
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#78909C",
    fontSize: 14,
  },
  registerLink: {
    color: "#00695C",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default LoginScreen;
