import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "./UserContext";
import Toast from "react-native-toast-message";

export default function NavBar() {
  const { user, setUser } = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const isLoggedIn = !!user;
  const currentRole = user?.currentRole || "Passenger";
  const roles = user?.roles || ["Passenger"];

  const handleMenuToggle = () => setMenuVisible(!menuVisible);
  const handleMenuClose = () => setMenuVisible(false);

  const handleLogout = () => {
    setUser(null);
    // AsyncStorage.removeItem('user'); // Uncomment if using AsyncStorage
    Toast.show({
      type: "info",
      text1: "Logged out successfully",
    });
    navigation.navigate("Home");
    handleMenuClose();
  };

  const handleSwitchRole = () => {
    if (!isLoggedIn) return;
    const otherRoles = roles.filter((r) => r !== currentRole);
    if (otherRoles.length > 0) {
      const newRole = otherRoles[0];
      const updatedUser = { ...user, currentRole: newRole };
      setUser(updatedUser);
      // AsyncStorage.setItem('user', JSON.stringify(updatedUser)); // Uncomment if using AsyncStorage
      Toast.show({
        type: "success",
        text1: `Switched to ${newRole} mode`,
      });
      handleMenuClose();
      navigation.navigate(newRole);
    } else {
      Toast.show({
        type: "info",
        text1: "No other role to switch to",
      });
    }
  };

  const showRegisterInfo = (role) => {
    Toast.show({
      type: "info",
      text1: `Please select ${role} role during registration`,
    });
    handleMenuClose();
  };

  return (
    <LinearGradient
      colors={["#43cea2", "#185a9d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {/* Logo and App Name */}
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={() => navigation.navigate("Home")}
      >
        <Image source={require("./assets/logo123.png")} style={styles.logo} />
        <Text style={styles.appName}>NexTrip</Text>

        {isLoggedIn && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{currentRole}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* User Menu */}
      <View style={styles.menuContainer}>
        {isLoggedIn && user?.picture && (
          <TouchableOpacity onPress={handleMenuToggle}>
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleMenuToggle}>
          <MaterialIcons name="menu" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleMenuClose}
        >
          <View style={styles.menuContent}>
            <ScrollView>
              {/* Home button for all roles */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  navigation.navigate("Home");
                  handleMenuClose();
                }}
              >
                <Ionicons
                  name="home"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Homepage</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {isLoggedIn ? (
                <>
                  {/* Dashboard Links */}
                  {currentRole === "Passenger" && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        navigation.navigate("Passenger");
                        handleMenuClose();
                      }}
                    >
                      <Text style={styles.menuText}>Passenger Dashboard</Text>
                    </TouchableOpacity>
                  )}

                  {currentRole === "Driver" && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        navigation.navigate("Driver");
                        handleMenuClose();
                      }}
                    >
                      <Text style={styles.menuText}>Driver Dashboard</Text>
                    </TouchableOpacity>
                  )}

                  {currentRole === "Admin" && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        navigation.navigate("Admin");
                        handleMenuClose();
                      }}
                    >
                      <Text style={styles.menuText}>Admin Dashboard</Text>
                    </TouchableOpacity>
                  )}

                  {/* Common Features */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      navigation.navigate("RideHistory");
                      handleMenuClose();
                    }}
                  >
                    <Text style={styles.menuText}>Ride History</Text>
                  </TouchableOpacity>

                  {currentRole === "Passenger" && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        navigation.navigate("RideInProgress");
                        handleMenuClose();
                      }}
                    >
                      <Text style={styles.menuText}>Ride In Progress</Text>
                    </TouchableOpacity>
                  )}

                  {/* Role Management */}
                  {roles.length > 1 && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleSwitchRole}
                    >
                      <Text style={styles.menuText}>
                        Switch to {roles.find((r) => r !== currentRole)}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.divider} />

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      navigation.navigate("Profile");
                      handleMenuClose();
                    }}
                  >
                    <Text style={styles.menuText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, styles.logoutItem]}
                    onPress={handleLogout}
                  >
                    <Text style={[styles.menuText, styles.logoutText]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      navigation.navigate("Login");
                      handleMenuClose();
                    }}
                  >
                    <Text style={styles.menuText}>Login</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => showRegisterInfo("Passenger")}
                  >
                    <Text style={styles.menuText}>Register as Passenger</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => showRegisterInfo("Driver")}
                  >
                    <Text style={styles.menuText}>Register as Driver</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === "ios" ? 90 : 70,
    paddingTop: Platform.OS === "ios" ? 30 : 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 4,
    borderBottomColor: "#43cea2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    padding: 4,
  },
  appName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    marginLeft: 10,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  roleBadge: {
    backgroundColor: "#00c896",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  roleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContent: {
    backgroundColor: "#f4f6fb",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "70%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: "#b71c1c",
    fontWeight: "700",
  },
});
