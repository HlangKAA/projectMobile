
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CourseCard = ({ course, isNextClass = false }) => {
    return (
        <View style={[styles.container, isNextClass && styles.nextClassContainer]}>
            <View style={styles.header}>
                <Text style={styles.codeContainer}>
                    <Text style={styles.code}>{course.code}</Text>
                </Text>
                <Text style={styles.time}>{course.time}</Text>
            </View>
            <Text style={styles.name}>{course.name}</Text>
            <Text style={styles.room}>{course.room}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#006D6D', // Theme color
    },
    nextClassContainer: {
        backgroundColor: '#E0F7FA', // Light cyan background for emphasis
        borderLeftColor: '#00BCD4',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    codeContainer: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
    },
    code: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    room: {
        fontSize: 14,
        color: '#555',
    },
});

export default CourseCard;
