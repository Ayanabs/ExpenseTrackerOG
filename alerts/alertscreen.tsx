import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../App';
import { checkAndNotify } from './spendingalertservice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme';

interface AlertScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'approaching' | 'exceeded' | 'warning';
}

const AlertScreen: React.FC<AlertScreenProps> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isRefreshing, refreshData } = useContext(AppContext);

  useEffect(() => {
    
    loadAlerts();
    
    
    checkAndNotify();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const storedAlerts = await AsyncStorage.getItem('spendingAlerts');
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    );
    
    setAlerts(updatedAlerts);
    
    try {
      await AsyncStorage.setItem('spendingAlerts', JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error saving read state:', error);
    }
  };

  const clearAllAlerts = async () => {
    setAlerts([]);
    try {
      await AsyncStorage.setItem('spendingAlerts', JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  };

  const renderAlertItem = ({ item }: { item: AlertItem }) => (
    <TouchableOpacity 
      style={[
        styles.alertItem, 
        item.read ? styles.readAlert : styles.unreadAlert,
        item.type === 'exceeded' ? styles.exceededAlert : 
        item.type === 'approaching' ? styles.approachingAlert : 
        styles.warningAlert
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <Text style={styles.alertTitle}>{item.title}</Text>
      <Text style={styles.alertMessage}>{item.message}</Text>
      <Text style={styles.alertDate}>
        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.noAlertsIconContainer}>
        <Text style={styles.noAlertsIcon}>🔔</Text>
        <View style={styles.slashOverlay} />
      </View>
      <Text style={styles.noAlertsText}>No alerts to display</Text>
      <Text style={styles.noAlertsSubtext}>
        You'll be notified when you approach or exceed your spending limits
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Icon name="arrow-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity onPress={loadAlerts} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>⟳</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContainer,
            alerts.length === 0 && styles.emptyListContainer
          ]}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={() => {
                loadAlerts();
                checkAndNotify();
                refreshData();
              }}
              colors={['#47248c']}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      <View style={styles.bottomBar}>
        <View style={styles.line} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d1e8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#000000',
    fontSize: 24,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#8b5cf6',
    fontSize: 24,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  alertItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  unreadAlert: {
    borderLeftWidth: 4,
  },
  readAlert: {
    opacity: 0.7,
  },
  exceededAlert: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  approachingAlert: {
    backgroundColor: '#fff8e1',
    borderLeftColor: '#ffc107',
  },
  warningAlert: {
    backgroundColor: '#e8f5e9',
    borderLeftColor: '#4caf50',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  alertDate: {
    fontSize: 12,
    color: '#888',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  noAlertsIconContainer: {
    position: 'relative',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noAlertsIcon: {
    fontSize: 50,
    color: '#9ca3af',
  },
  slashOverlay: {
    position: 'absolute',
    width: 2,
    height: 70,
    backgroundColor: '#9ca3af',
    transform: [{ rotate: '45deg' }],
  },
  noAlertsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  noAlertsSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  line: {
    width: 100,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 10,
  }
});

export default AlertScreen;