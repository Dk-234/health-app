import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, IconButton } from 'react-native-paper';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { healthService } from '../services/authService';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  
  // Mock data - Will be replaced with local health data
  const [healthData, setHealthData] = useState({
    steps: 0,
    heartRate: 0,
    sleep: 0,
    calories: 0,
  });

  const [heartRateData, setHeartRateData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [68, 72, 75, 70, 73, 71, 72],
    }],
  });

  const [stepsData, setStepsData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [7500, 8200, 9100, 7800, 8900, 10200, 8547],
    }],
  });

  const [progressData, setProgressData] = useState({
    labels: ['Steps', 'Sleep', 'Water', 'Calories'],
    data: [0.85, 0.75, 0.60, 0.92],
  });

  useEffect(() => {
    loadHealthData();
  }, [selectedPeriod, user]);

  useEffect(() => {
    // Set header right with profile and settings buttons
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.headerButtonIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.profileButtonContainer}>
              {user?.avatar ? (
                <Text style={styles.avatarEmoji}>{user.avatar}</Text>
              ) : (
                <Text style={styles.profileInitial}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, user]);

  const loadHealthData = async () => {
    if (!user) return;
    
    try {
      // Get today's summary from local service
      const summary = await healthService.getTodaySummary(user.uid);
      setHealthData({
        steps: summary.steps || 0,
        heartRate: summary.heartRate || 0,
        sleep: summary.sleepHours || 0,
        calories: summary.calories || 0,
      });

      // Load historical data for charts
      console.log('Health data loaded successfully');
    } catch (error) {
      console.error('Error loading health data:', error);
      // Use mock data as fallback
      setHealthData({
        steps: 8547,
        heartRate: 72,
        sleep: 7.5,
        calories: 2341,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHealthData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigation.replace('Login');
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogout}
        />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{healthData.steps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{healthData.heartRate}</Text>
            <Text style={styles.statLabel}>Heart Rate</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{healthData.sleep}h</Text>
            <Text style={styles.statLabel}>Sleep</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{healthData.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['7d', '30d', '90d'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Heart Rate Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Heart Rate (bpm)</Text>
          <LineChart
            data={heartRateData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Steps Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Daily Steps</Text>
          <BarChart
            data={stepsData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Progress Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Today's Goals Progress</Text>
          <ProgressChart
            data={progressData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
          <View style={styles.legendContainer}>
            <Text style={styles.legendText}>Steps: 85%</Text>
            <Text style={styles.legendText}>Sleep: 75%</Text>
            <Text style={styles.legendText}>Water: 60%</Text>
            <Text style={styles.legendText}>Calories: 92%</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  periodButtonText: {
    color: '#666',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chartCard: {
    margin: 10,
    backgroundColor: '#fff',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    width: '48%',
    marginBottom: 5,
  },
  bottomPadding: {
    height: 20,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonIcon: {
    fontSize: 20,
  },
  profileButton: {
    marginRight: 16,
    borderRadius: 20,
  },
  profileButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default DashboardScreen;
