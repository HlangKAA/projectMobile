
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExamCard = ({ exam }) => {
    const isUrgent = exam.daysLeft <= 3; // Highlight if less than 3 days

    return (
        <View style={styles.container}>
            <View style={[styles.dateBox, isUrgent ? styles.urgentDateBox : styles.normalDateBox]}>
                <Text style={styles.month}>{exam.month}</Text>
                <Text style={styles.day}>{exam.day}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{exam.subject}</Text>
                <Text style={styles.time}>{exam.time}</Text>
            </View>
            <View style={styles.daysLeftTag}>
                <Text style={styles.daysLeftText}>อีก {exam.daysLeft} วัน</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    dateBox: {
        width: 60,
        height: 60,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    normalDateBox: {
        backgroundColor: '#E0F2F1',
    },
    urgentDateBox: {
        backgroundColor: '#FFEBEE', // Red tint for urgent
    },
    month: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: '#555',
    },
    day: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
    daysLeftTag: {
        backgroundColor: '#006D6D',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 5,
    },
    daysLeftText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ExamCard;
