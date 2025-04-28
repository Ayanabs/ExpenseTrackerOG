import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Category } from './category';
import { COLORS } from '../../theme';
import { fetchCategoriesWithExpenses } from './categoryservice'; // Adjust path as needed

// Define props interface for the component
interface ExpenseCategoriesContainerProps {
  categories?: Category[];
  isLoading?: boolean;
}

const CategoriesContainer: React.FC<ExpenseCategoriesContainerProps> = ({ 
  categories: propCategories, 
  isLoading: propIsLoading 
}) => {
  // Use local state if props are not provided
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexUrl, setIndexUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true); // State to track if category list is expanded

  useEffect(() => {
    // Skip fetching if props are provided
    if (propCategories !== undefined || propIsLoading !== undefined) {
      return;
    }

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCategories = await fetchCategoriesWithExpenses();
        setLocalCategories(fetchedCategories);
      } catch (err: any) {
        console.error('Error loading categories:', err);
        
        // Extract index URL if present in the error message
        const indexUrlMatch = err.message?.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/);
        if (indexUrlMatch) {
          setIndexUrl(indexUrlMatch[0]);
          setError('Firestore index required. Please tap "Create Index" to fix this issue.');
        } else if (err.message?.includes('No active spending period')) {
          setError('No active spending period found. Please set a spending limit first.');
        } else {
          setError('Failed to load expense categories');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [propCategories, propIsLoading]);

  // Toggle the expansion state of the category list
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine which data sources to use
  const categories = propCategories !== undefined ? propCategories : localCategories;
  const isLoading = propIsLoading !== undefined ? propIsLoading : loading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={40} color={COLORS.danger} />
        <Text style={styles.errorText}>{error}</Text>
        {indexUrl && (
          <TouchableOpacity 
            style={styles.indexButton} 
            onPress={() => Linking.openURL(indexUrl)}
          >
            <Text style={styles.indexButtonText}>Create Index</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="cash-remove" size={40} color={COLORS.gray} />
        <Text style={styles.emptyText}>No expense categories found</Text>
        <Text style={styles.emptySubText}>Start adding expenses to see categories here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chevron button to toggle expansion */}
      <TouchableOpacity 
        style={styles.chevronContainer} 
        onPress={toggleExpansion}
        activeOpacity={0.7}
      >
        <Icon 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={COLORS.white} 
        />
      </TouchableOpacity>
      
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Expense Categories</Text>
      </View>

      {isExpanded && (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => {
              const percentage = Math.min(100, (category.spent / category.limit) * 100);
              const isOverLimit = category.spent > category.limit;
              
              // Determine progress bar color based on percentage
              const getProgressColor = () => {
                if (isOverLimit) return COLORS.danger;
                if (percentage > 80) return '#FFA500'; // Orange for warning
                return category.color;
              };

              return (
                <View key={category.id} style={styles.card}>
                  <View style={styles.leftSection}>
                    <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
                      <Icon name={category.icon} size={24} color={category.color} />
                    </View>
                    <View style={styles.nameContainer}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.spentText}>Rs {category.spent.toFixed(0)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.rightSection}>
                    <Text style={styles.limitText}>Limit: Rs {category.limit.toFixed(0)}</Text>
                    <View style={styles.progressContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          {
                            width: `${percentage}%`,
                            backgroundColor: getProgressColor()
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme background
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chevronContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.white,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  indexButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  indexButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    color: COLORS.gray,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#1E1E1E', // Slightly lighter than background for card
    borderRadius: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  spentText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  rightSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  limitText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  progressContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  }
});

export default CategoriesContainer;