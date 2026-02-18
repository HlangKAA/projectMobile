import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Dashboard = () => {
  const { courses, studyPlan, exams, simulatedDate } = useContext(AppContext);

  // Helper: get day name from simulatedDate
  const todayDayName = DAYS_SHORT[simulatedDate.getDay()];

  // Current simulated time in minutes
  const currentMinutes =
    simulatedDate.getHours() * 60 + simulatedDate.getMinutes();

  // Today's courses sorted by start time
  const todayCourses = useMemo(() => {
    return courses
      .filter((c) => c.day === todayDayName)
      .map((c) => {
        const timeParts = c.time.replace(/\s/g, "").split("-");
        const [h, m] = (timeParts[0] || "0:0").split(/[:.]/);
        const startMin = parseInt(h) * 60 + parseInt(m || "0");
        return { ...c, startMin };
      })
      .sort((a, b) => a.startMin - b.startMin);
  }, [courses, todayDayName]);

  // Next class: first course starting after current simulated time, or the current one
  const nextClass = useMemo(() => {
    const upcoming = todayCourses.filter((c) => c.startMin > currentMinutes);
    if (upcoming.length > 0) return upcoming[0];
    // If no upcoming, show the last one (might be currently studying)
    return todayCourses.length > 0
      ? todayCourses[todayCourses.length - 1]
      : null;
  }, [todayCourses, currentMinutes]);

  // Minutes until next class
  const minutesUntilNext = nextClass
    ? nextClass.startMin - currentMinutes
    : null;

  // Study Plan Progress
  const completedTasks = studyPlan.filter((t) => t.completed).length;
  const totalTasks = studyPlan.length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming exams (within this week from simulated date)
  const upcomingExams = useMemo(() => {
    const now = new Date(simulatedDate);
    now.setHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 30); // Show exams within a month

    return exams
      .map((exam) => {
        const examDate = new Date(exam.date + "T00:00:00");
        const diffTime = examDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...exam, daysLeft, examDate };
      })
      .filter((exam) => exam.daysLeft >= 0 && exam.examDate <= weekEnd)
      .sort((a, b) => a.examDate - b.examDate);
  }, [exams, simulatedDate]);

  const getExamMonthDay = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return { month: months[d.getMonth()], day: d.getDate().toString() };
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={24} color="#006D6D" />
          </View>
          <View>
            <Text style={styles.yearText}>ปีการศึกษา 2569</Text>
            <Text style={styles.greeting}>สวัสดี คุณวรัทภพ</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.mailButton}>
          <Ionicons name="mail-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <View style={styles.section}>
        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressTitle}>ความคืบหน้าวันนี้</Text>
            <Text style={styles.progressCount}>
              เสร็จสิ้น {completedTasks} จาก {totalTasks} งาน
            </Text>
          </View>
          <View style={styles.circularProgress}>
            <View style={styles.circleOuter}>
              <View style={styles.circleInner}>
                <Text style={styles.progressText}>{progressPercent}%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Next Class */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>วิชาถัดไป</Text>
        {nextClass ? (
          <View style={styles.nextClassCard}>
            <View style={styles.classImagePlaceholder}>
              <Ionicons name="school" size={40} color="#fff" />
              {minutesUntilNext != null && minutesUntilNext > 0 && (
                <View style={styles.nextClassTag}>
                  <Text style={styles.nextClassTagText}>
                    เริ่มเรียนในอีก {minutesUntilNext} นาที
                  </Text>
                </View>
              )}
              {minutesUntilNext != null && minutesUntilNext <= 0 && (
                <View
                  style={[styles.nextClassTag, { backgroundColor: "#FFE082" }]}
                >
                  <Text style={[styles.nextClassTagText, { color: "#F57F17" }]}>
                    กำลังเรียนอยู่
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.classInfoContainer}>
              <View style={styles.classHeaderRow}>
                <Text style={styles.className}>{nextClass.name}</Text>
                <TouchableOpacity style={styles.enterClassBtn}>
                  <Text style={styles.enterClassText}>เข้าเรียน</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.classDetailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color="#333" />
                  <Text style={styles.detailText}>{nextClass.time}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color="#333" />
                  <Text style={styles.detailText}>{nextClass.room}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="school-outline" size={24} color="#999" />
            <Text style={styles.emptyText}>
              ไม่มีวิชาเรียนในวัน{todayDayName}
            </Text>
          </View>
        )}
      </View>

      {/* Upcoming Exams */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>การสอบที่ใกล้เข้ามาถึง</Text>
        {upcomingExams.length > 0 ? (
          upcomingExams.map((exam) => {
            const { month, day } = getExamMonthDay(exam.date);
            return (
              <View key={exam.id} style={styles.examCard}>
                <View style={styles.examDateBox}>
                  <Text style={styles.examMonth}>{month}</Text>
                  <Text style={styles.examDay}>{day}</Text>
                </View>
                <View style={styles.examInfo}>
                  <Text style={styles.examSubject}>{exam.subject}</Text>
                  <Text style={styles.examTime}>{exam.time}</Text>
                </View>
                <View style={styles.examBadge}>
                  <Text style={styles.examBadgeText}>
                    อีก {exam.daysLeft} วัน
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyExamCard}>
            <View style={styles.calendarIconBox}>
              <Ionicons name="calendar-outline" size={24} color="#999" />
            </View>
            <Text style={styles.emptyExamText}>
              ไม่มีการสอบอื่นในสัปดาห์นี้
            </Text>
          </View>
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: 50,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#B2DFDB",
  },
  yearText: {
    fontSize: 12,
    color: "#006D6D",
    fontWeight: "bold",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  mailButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    elevation: 2,
  },
  /* Progress Card */
  progressCard: {
    backgroundColor: "#00695C",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  progressTitle: {
    color: "#A7FFEB",
    fontSize: 14,
    marginBottom: 5,
  },
  progressCount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  circularProgress: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  circleOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
    borderLeftColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  circleInner: {
    transform: [{ rotate: "-45deg" }],
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  /* Next Class */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  nextClassCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  classImagePlaceholder: {
    height: 140,
    backgroundColor: "#00695C",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  nextClassTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  nextClassTagText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#00695C",
  },
  classInfoContainer: {
    paddingHorizontal: 5,
  },
  classHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  className: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  enterClassBtn: {
    backgroundColor: "#00695C",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  enterClassText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  classDetailRow: {
    flexDirection: "row",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  detailText: {
    marginLeft: 5,
    color: "#333",
    fontSize: 12,
  },
  /* Exam Card */
  examCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  examDateBox: {
    backgroundColor: "#00695C",
    borderRadius: 10,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  examMonth: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  examDay: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  examInfo: {
    flex: 1,
  },
  examSubject: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  examTime: {
    fontSize: 12,
    color: "#AFB42B",
    fontWeight: "bold",
  },
  examBadge: {
    backgroundColor: "#00695C",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  examBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  /* Empty Exam Card */
  emptyExamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
  },
  calendarIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  emptyExamText: {
    flex: 1,
    color: "#999",
  },
  /* Empty Card */
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    gap: 15,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
    flex: 1,
  },
  /* FAB */
  fab: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
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
});

export default Dashboard;
