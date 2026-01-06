import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, Animated, Easing, Pressable, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import SpinnzScreen from '../screens/SpinnzScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UploadScreen from '../screens/UploadScreen';
import VinylIcon from '../components/VinylIcon';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Animated icon wrapper for scale-on-focus
const AnimatedIcon = ({ focused, children }) => {
  const scale = useRef(new Animated.Value(focused ? 1.25 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.25 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
};

const MainTabs = () => {
  const [spinTrigger, setSpinTrigger] = useState(0);

  const createSpinAnim = () => {
    const rotation = new Animated.Value(0);
    const trailOuter = new Animated.Value(0.8);
    const trailInner = new Animated.Value(0.6);

    const spin = () => {
      rotation.setValue(0);
      trailOuter.setValue(0.8);
      trailInner.setValue(0.6);
      Animated.parallel([
        Animated.timing(rotation, {
          // Spin multiple revolutions for a longer effect (~2 seconds)
          toValue: 3, // 3 full rotations
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(trailOuter, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(trailInner, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    };

    return { rotation, trailOuter, trailInner, spin };
  };

  const SpinnzIcon = ({ color, size, focused, spinFlag }) => {
    const { rotation, trailOuter, trailInner, spin } = useMemo(createSpinAnim, []);

    useEffect(() => {
      spin();
    }, [spinFlag, focused, spin]);

    const rotate = rotation.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: ['0deg', '360deg', '720deg', '1080deg'],
    });

    const trailColorOuter = rotation.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#ef476f'],
    });

    const trailColorInner = rotation.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#ff6b6b'],
    });

    return (
      <Animated.View style={{ transform: [{ scale: focused ? 1.25 : 1.05 }, { rotate }] }}>
        <View>
          <VinylIcon size={size} color={color} />
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: size,
              borderWidth: 2,
              borderColor: trailColorOuter,
              opacity: trailOuter,
            }}
          />
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: size * 0.1,
              left: size * 0.1,
              right: size * 0.1,
              bottom: size * 0.1,
              borderRadius: size * 0.8,
              borderWidth: 2,
              borderColor: trailColorInner,
              opacity: trailInner,
            }}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <Feather name="home" size={size} color={color} />
            </AnimatedIcon>
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={(e) => {
                Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                props.onPress?.(e);
              }}
              style={({ pressed }) => [
                { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 },
                props.style,
              ]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Spinnz"
        component={SpinnzScreen}
        options={{
          tabBarLabel: 'Spinnz',
          tabBarIcon: ({ color, size, focused }) => (
            <SpinnzIcon color={color} size={size} focused={focused} spinFlag={spinTrigger} />
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={(e) => {
                setSpinTrigger((s) => s + 1);
                props.onPress?.(e);
              }}
              style={({ pressed }) => [
                { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 },
                props.style,
              ]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
            </AnimatedIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <Feather name="search" size={size} color={color} />
            </AnimatedIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <MaterialIcons name="person-outline" size={size} color={color} />
            </AnimatedIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Upload" component={UploadScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

