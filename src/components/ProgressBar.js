
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ progress, label }) => {
    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        width: '100%',
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#006D6D', // Theme color
    },
    percentage: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#006D6D',
    },
    track: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: '#006D6D', // Theme color
        borderRadius: 5,
    },
});

export default ProgressBar;
