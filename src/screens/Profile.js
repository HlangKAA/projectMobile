
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    const handleClearData = () => {
        Alert.alert(
            "ล้างข้อมูลทั้งหมด",
            "คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้",
            [
                { text: "ยกเลิก", style: "cancel" },
                { text: "ลบข้อมูล", onPress: () => console.log("Data cleared"), style: "destructive" }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => console.log('Back')}>
                    <Ionicons name="arrow-back" size={24} color="#006D6D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>โปรไฟล์</Text>
                <TouchableOpacity onPress={() => console.log('Menu')}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#006D6D" />
                </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} />
                    <TouchableOpacity style={styles.editAvatarBtn}>
                        <Ionicons name="pencil" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>วรัทภพ ธภัทรสรุวรรณ</Text>
                <Text style={styles.subText}>คณะศิลปศาสตร์และวิทยาศาสตร์</Text>
                <Text style={styles.subText}>สาขา วิทยาการคอมพิวเตอร์</Text>

                <TouchableOpacity style={styles.editProfileBtn}>
                    <Text style={styles.editProfileText}>แก้ไขโปรไฟล์</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>เกรดเฉลี่ย</Text>
                    <Text style={styles.statVal}>3.99</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>หน่วยกิต</Text>
                    <Text style={styles.statVal}>109</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>สถานะ</Text>
                    <Text style={[styles.statVal, { color: 'red', fontSize: 16 }]}>NOT PASS</Text>
                </View>
            </View>

            {/* Settings Sections */}
            <Text style={styles.sectionTitle}>ตั้งค่าบัญชี</Text>
            <View style={styles.settingsGroup}>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="lock-closed-outline" size={22} color="#555" />
                        <Text style={styles.settingText}>ตั้งค่าส่วนตัว</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="notifications-outline" size={22} color="#555" />
                        <Text style={styles.settingText}>แจ้งเตือน</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="globe-outline" size={22} color="#555" />
                        <Text style={styles.settingText}>เปลี่ยนภาษา</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#aaa', marginRight: 5 }}>English</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>การตั้งค่าแอป</Text>
            <View style={styles.settingsGroup}>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="moon-outline" size={22} color="#555" />
                        <Text style={styles.settingText}>โหมดมืด</Text>
                    </View>
                    <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: "#767577", true: "#006D6D" }} />
                </View>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="server-outline" size={22} color="#555" />
                        <Text style={styles.settingText}>การจัดการพื้นที่เก็บข้อมูล</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
            </View>

            {/* Support */}
            <Text style={styles.sectionTitle}>สนับสนุน</Text>
            <View style={styles.settingsGroup}>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="help-circle-outline" size={22} color="#555" />
                        <Text style={styles.settingText}>ศูนย์ช่วยเหลือ</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="information-circle-outline" size={22} color="#555" />
                        <Text style={styles.settingText}>เกี่ยวกับ StudySync</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
            </View>

            {/* Clear Data Button */}
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearData}>
                <Ionicons name="trash" size={20} color="red" style={{ marginRight: 10 }} />
                <Text style={styles.clearText}>ล้างข้อมูลทั้งหมด</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Light grey background
        padding: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#90A4AE', // Greyish blue
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    editProfileBtn: {
        marginTop: 15,
        backgroundColor: '#00695C', // Dark teal
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    editProfileText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        elevation: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: 'bold', // Bold label
        color: '#333',
        marginBottom: 5,
    },
    statVal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 10,
    },
    settingsGroup: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 5,
        marginBottom: 10,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        marginLeft: 15,
        fontSize: 14,
        color: '#333',
    },
    clearBtn: {
        flexDirection: 'row',
        backgroundColor: '#FFE5E5',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    clearText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default Profile;