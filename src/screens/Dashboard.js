
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = () => {
    // Mock Data
    const nextClass = {
        code: '01418322',
        name: 'Introduction to Data Science',
        time: '17:00 น. - 20:00 น.',
        room: 'SC 9 - 402',
        image: 'https://via.placeholder.com/400x200/0000FF/FFFFFF?text=Data+Science' // Placeholder
    };

    const upcomingExams = [
        { id: 1, subject: 'Mobile Application Design and Development', month: 'MAR', day: '21', time: '13:00 - 16:00', daysLeft: 3 },
        { id: 2, subject: 'Sufficiency Economy for Living', month: 'MAR', day: '24', time: '09:00 - 11:00', daysLeft: 6 },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
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
                        <Text style={styles.progressCount}>เสร็จสิ้น 4 จาก 6 งาน</Text>
                    </View>
                    <View style={styles.circularProgress}>
                        {/* Simulated Circular Progress */}
                        <View style={styles.circleOuter}>
                            <View style={styles.circleInner}>
                                <Text style={styles.progressText}>66%</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Next Class */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>วิชาถัดไป</Text>
                <View style={styles.nextClassCard}>
                    <ImageBackground
                        source={{ uri: nextClass.image }}
                        style={styles.classImageBackground}
                        imageStyle={{ borderRadius: 15 }}
                    >
                        <View style={styles.nextClassOverlay}>
                            <View style={styles.nextClassTag}><Text style={styles.nextClassTagText}>เริ่มเรียนในอีก 15 นาที</Text></View>
                        </View>
                    </ImageBackground>

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
            </View>

            {/* Upcoming Exams */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>การสอบที่ใกล้เข้ามาถึง</Text>
                {upcomingExams.map(exam => (
                    <View key={exam.id} style={styles.examCard}>
                        <View style={styles.examDateBox}>
                            <Text style={styles.examMonth}>{exam.month}</Text>
                            <Text style={styles.examDay}>{exam.day}</Text>
                        </View>
                        <View style={styles.examInfo}>
                            <Text style={styles.examSubject}>{exam.subject}</Text>
                            <Text style={styles.examTime}>{exam.time}</Text>
                        </View>
                        <View style={styles.examBadge}>
                            <Text style={styles.examBadgeText}>อีก {exam.daysLeft} วัน</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <View style={styles.emptyExamCard}>
                    <View style={styles.calendarIconBox}>
                        <Ionicons name="calendar-outline" size={24} color="#999" />
                    </View>
                    <Text style={styles.emptyExamText}>ไม่มีการสอบอื่นในสัปดาห์นี้</Text>
                    <TouchableOpacity style={styles.addExamBtnBig}>
                        <Ionicons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        paddingTop: 50,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    yearText: {
        fontSize: 12,
        color: '#006D6D',
        fontWeight: 'bold',
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    mailButton: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 10,
        elevation: 2,
    },
    /* Progress Card */
    progressCard: {
        backgroundColor: '#00695C', // Dark Teal
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    progressTitle: {
        color: '#A7FFEB', // Light Teal
        fontSize: 14,
        marginBottom: 5,
    },
    progressCount: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    circularProgress: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleOuter: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: '#FFC107', // Gold/Yellow
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftColor: 'transparent', // Simple Hack for "Partial" circle look
        transform: [{ rotate: '45deg' }]
    },
    circleInner: {
        transform: [{ rotate: '-45deg' }] // Counter rotate text
    },
    progressText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    /* Next Class */
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    nextClassCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    classImageBackground: {
        height: 120,
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    nextClassOverlay: {
        padding: 10,
    },
    nextClassTag: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    nextClassTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#00695C',
    },
    classInfoContainer: {
        paddingHorizontal: 5,
    },
    classHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    className: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    enterClassBtn: {
        backgroundColor: '#00695C',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    enterClassText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    classDetailRow: {
        flexDirection: 'row',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    detailText: {
        marginLeft: 5,
        color: '#333',
        fontSize: 12,
    },
    /* Exam Card */
    examCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
    },
    examDateBox: {
        backgroundColor: '#00695C',
        borderRadius: 10,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    examMonth: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    examDay: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    examInfo: {
        flex: 1,
    },
    examSubject: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    examTime: {
        fontSize: 12,
        color: '#GOLD', // Fix this color
        color: '#AFB42B',
        fontWeight: 'bold',
    },
    examBadge: {
        backgroundColor: '#00695C',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    examBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    /* Empty Exam Card */
    emptyExamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        justifyContent: 'space-between',
    },
    calendarIconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    emptyExamText: {
        flex: 1,
        color: '#999',
    },
    addExamBtnBig: {
        backgroundColor: '#00695C',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    }
});

export default Dashboard;
