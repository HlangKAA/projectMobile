import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];
const PERIOD_OPTIONS = ["วันนี้", "สัปดาห์หน้า", "เดือนหน้า"];

// ── Helper: Parse "HH:MM" or "HH.MM" string to minutes ──────────────────
const toMinutes = (str) => {
  if (!str) return 0;
  const s = str.replace(/\s/g, "").replace(/น\./g, "");
  const sep = s.includes(":") ? ":" : ".";
  const [h, m] = s.split(sep);
  return parseInt(h || "0") * 60 + parseInt(m || "0");
};

const getStartMin = (timeStr) => {
  const parts = (timeStr || "").replace(/\s/g, "").split("-");
  return toMinutes(parts[0]);
};

const Dashboard = () => {
  const { courses, studyPlan, exams, simulatedDate, userProfile } =
    useContext(AppContext);

  // ── Time-Travel period selector ────────────────────────────────────────
  const [period, setPeriod] = useState("วันนี้");

  // ── Derived "reference" date based on selected period ─────────────────
  const referenceDate = useMemo(() => {
    const base = new Date(simulatedDate);
    base.setHours(0, 0, 0, 0);
    if (period === "สัปดาห์หน้า") {
      // Start of next week (Mon)
      const dayOfWeek = base.getDay();
      const daysToNextMon = (8 - dayOfWeek) % 7 || 7;
      base.setDate(base.getDate() + daysToNextMon);
    } else if (period === "เดือนหน้า") {
      base.setMonth(base.getMonth() + 1, 1);
    }
    return base;
  }, [simulatedDate, period]);

  // ── Date range end ────────────────────────────────────────────────────
  const rangeEnd = useMemo(() => {
    const end = new Date(referenceDate);
    if (period === "วันนี้") {
      end.setDate(end.getDate() + 1);
    } else if (period === "สัปดาห์หน้า") {
      end.setDate(end.getDate() + 7);
    } else {
      // Next month: entire month
      end.setMonth(end.getMonth() + 1, 1);
    }
    return end;
  }, [referenceDate, period]);

  // ── Day name for the reference date ──────────────────────────────────
  const refDayName = DAYS_SHORT[referenceDate.getDay()];

  // ── Today's / reference period's courses ─────────────────────────────
  const periodCourses = useMemo(() => {
    if (period === "วันนี้") {
      return courses
        .filter((c) => c.day === refDayName)
        .map((c) => ({ ...c, startMin: getStartMin(c.time) }))
        .sort((a, b) => a.startMin - b.startMin);
    }
    // For next week / next month: gather all unique days in the period and count
    return courses; // Show all courses for summary view
  }, [courses, refDayName, period]);

  // Current simulated time in minutes (for "วันนี้" logic)
  const currentMinutes =
    simulatedDate.getHours() * 60 + simulatedDate.getMinutes();

  // ── Next Class (วันนี้ only) ─────────────────────────────────────────
  const nextClass = useMemo(() => {
    if (period !== "วันนี้") return null;
    const upcoming = periodCourses.filter((c) => c.startMin > currentMinutes);
    if (upcoming.length > 0) return upcoming[0];
    return periodCourses.length > 0
      ? periodCourses[periodCourses.length - 1]
      : null;
  }, [period, periodCourses, currentMinutes]);

  const minutesUntilNext = nextClass
    ? nextClass.startMin - currentMinutes
    : null;

  // ── Study Plan Progress ───────────────────────────────────────────────
  const completedTasks = studyPlan.filter((t) => t.completed).length;
  const totalTasks = studyPlan.length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ── Upcoming Exams (reactive to period) ──────────────────────────────
  const upcomingExams = useMemo(() => {
    const rangeStart = new Date(referenceDate);
    return exams
      .map((exam) => {
        const examDate = new Date(exam.date + "T00:00:00");
        const diffTime =
          examDate.getTime() - new Date(simulatedDate).setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...exam, daysLeft, examDate };
      })
      .filter(
        (exam) =>
          exam.examDate >= rangeStart &&
          exam.examDate < rangeEnd &&
          exam.daysLeft >= 0,
      )
      .sort((a, b) => a.examDate - b.examDate);
  }, [exams, referenceDate, rangeEnd, simulatedDate]);

  // ── Week summary (สัปดาห์หน้า / เดือนหน้า) ──────────────────────────
  const periodSummary = useMemo(() => {
    if (period === "วันนี้") return null;
    const totalCourses = courses.length;
    const totalExams = upcomingExams.length;
    const pendingTasks = studyPlan.filter((t) => !t.completed).length;
    return { totalCourses, totalExams, pendingTasks };
  }, [period, courses, upcomingExams, studyPlan]);

  // ── Helper: Exam date display ─────────────────────────────────────────
  const getExamMonthDay = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      month: THAI_MONTHS_SHORT[d.getMonth()],
      day: d.getDate().toString(),
    };
  };

  // ── Period label for section headings ────────────────────────────────
  const periodLabel =
    period === "วันนี้"
      ? "วันนี้"
      : period === "สัปดาห์หน้า"
        ? "สัปดาห์หน้า"
        : "เดือนหน้า";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            {userProfile?.profileUrl ? (
              <Image
                source={{ uri: userProfile.profileUrl }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <Ionicons name="person" size={24} color="#006D6D" />
            )}
          </View>
          <View>
            <Text style={styles.yearText}>ปีการศึกษา 2569</Text>
            <Text style={styles.greeting}>
              สวัสดี คุณ{userProfile?.firstName || ""}
            </Text>
          </View>
        </View>
      </View>

      {/* ══ Time-Travel Period Selector (Challenge 2) ══════════════════ */}
      <View style={styles.periodSelector}>
        {PERIOD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.periodPill,
              period === opt && styles.periodPillActive,
            ]}
            onPress={() => setPeriod(opt)}
          >
            <Text
              style={[
                styles.periodPillText,
                period === opt && styles.periodPillTextActive,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Card */}
      <View style={styles.section}>
        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressTitle}>ความคืบหน้า{periodLabel}</Text>
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

      {/* ── วันนี้: Next Class card ──────────────────────────────────── */}
      {period === "วันนี้" && (
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
                    style={[
                      styles.nextClassTag,
                      { backgroundColor: "#FFE082" },
                    ]}
                  >
                    <Text
                      style={[styles.nextClassTagText, { color: "#F57F17" }]}
                    >
                      กำลังเรียนอยู่
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.classInfoContainer}>
                <View style={styles.classHeaderRow}>
                  <Text style={styles.className}>{nextClass.name}</Text>
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
              <View style={styles.emptyIconBox}>
                <Ionicons name="school-outline" size={32} color="#B0BEC5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyTitle}>ไม่มีวิชาเรียน</Text>
                <Text style={styles.emptyText}>ไม่มีคลาสในวัน{refDayName}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── Week / Month: Summary Cards ──────────────────────────────── */}
      {periodSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สรุป{periodLabel}</Text>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="book-outline" size={28} color="#00695C" />
              <Text style={styles.summaryNumber}>
                {periodSummary.totalCourses}
              </Text>
              <Text style={styles.summaryLabel}>วิชาเรียน</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons
                name="document-text-outline"
                size={28}
                color="#1565C0"
              />
              <Text style={[styles.summaryNumber, { color: "#1565C0" }]}>
                {periodSummary.totalExams}
              </Text>
              <Text style={styles.summaryLabel}>การสอบ</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#FFF8E1" }]}>
              <Ionicons name="clipboard-outline" size={28} color="#F57F17" />
              <Text style={[styles.summaryNumber, { color: "#F57F17" }]}>
                {periodSummary.pendingTasks}
              </Text>
              <Text style={styles.summaryLabel}>งานค้าง</Text>
            </View>
          </View>
        </View>
      )}

      {/* Upcoming Exams */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          การสอบ{period === "วันนี้" ? "ที่ใกล้เข้ามาถึง" : `ใน${periodLabel}`}
        </Text>
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
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="calendar-outline" size={32} color="#B0BEC5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>ไม่มีข้อมูลการสอบ</Text>
              <Text style={styles.emptyText}>ไม่มีการสอบใน{periodLabel}</Text>
            </View>
          </View>
        )}
      </View>
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
    marginBottom: 16,
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
  /* ── Period Selector Pills (Challenge 2) ─────────────────────────── */
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 18,
    gap: 8,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
  },
  periodPillActive: {
    backgroundColor: "#00695C",
  },
  periodPillText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#00695C",
  },
  periodPillTextActive: {
    color: "#fff",
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
  /* Section Title */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  /* Summary Row (Week / Month) */
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00695C",
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  /* Next Class Card */
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
  /* Empty card */
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 15,
    elevation: 1,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#78909C",
    marginBottom: 3,
  },
  emptyText: {
    color: "#90A4AE",
    fontSize: 13,
  },
});

export default Dashboard;
