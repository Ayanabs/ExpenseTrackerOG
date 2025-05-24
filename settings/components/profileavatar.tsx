import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, ImageLibraryOptions, MediaType } from 'react-native-image-picker';

interface ProfileAvatarProps {
  onImageChange?: (uri: string | null) => void;
  onThemeToggle?: () => void;
  showThemeButton?: boolean;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  storageKey?: string;
}

const ProfileAvatar = ({ 
  onImageChange,
  onThemeToggle,
  showThemeButton = true,
  size = 100,
  borderColor = '#EAE9E2',
  borderWidth = 3,
  storageKey = 'profile_avatar_image'
}: ProfileAvatarProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved image on component mount
  useEffect(() => {
    loadSavedImage();
  }, []);

  // Load image from AsyncStorage
  const loadSavedImage = async () => {
    try {
      const savedImageUri = await AsyncStorage.getItem(storageKey);
      if (savedImageUri) {
        setImageUri(savedImageUri);
      }
    } catch (error) {
      console.log('Error loading saved image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save image to AsyncStorage
  const saveImage = async (uri: string | null) => {
    try {
      if (uri) {
        await AsyncStorage.setItem(storageKey, uri);
      } else {
        await AsyncStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.log('Error saving image:', error);
    }
  };

  // Get the image source to display
  const getImageSource = () => {
    if (imageUri) {
      return { uri: imageUri };
    }
    return require('../../assets/avatar.png');
  };

  // Handle image selection from gallery
  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Error', 'Failed to select image');
        return;
      }

      if (response.assets && response.assets[0] && response.assets[0].uri) {
        const selectedImageUri = response.assets[0].uri;
        setImageUri(selectedImageUri);
        
        // Callback to parent component with the new image URI
        if (onImageChange) {
          onImageChange(selectedImageUri);
        }
      }
    });
  };

  // Handle long press to show options
  const handleLongPress = () => {
    Alert.alert(
      'Avatar Options',
      'Choose an action',
      [
        {
          text: 'Select from Gallery',
          onPress: selectImage,
        },
        {
          text: 'Remove Custom Image',
          onPress: () => {
            setImageUri(null);
            saveImage(null); // Remove from AsyncStorage
            if (onImageChange) {
              onImageChange(null);
            }
          },
          style: imageUri ? 'destructive' : 'cancel',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Don't render until we've loaded the saved image
  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={[
          styles.image,
          styles.loadingContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: borderColor,
            borderWidth: borderWidth,
          }
        ]} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        onPress={selectImage}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <Image
          source={getImageSource()}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: borderColor,
              borderWidth: borderWidth,
            }
          ]}
        />
        {/* Camera icon overlay to indicate it's tappable */}
        <View style={styles.cameraIconContainer}>
          <Icon name="camera" size={16} color="#FFF" />
        </View>
      </TouchableOpacity>
      
      {showThemeButton && (
        <TouchableOpacity 
          style={styles.toggleThemeBtn}
          onPress={onThemeToggle}
        >
          <Icon name="weather-night" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 28,
    position: 'relative',
  },
  image: {
    marginTop: 10,
  },
  loadingContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  toggleThemeBtn: {
    position: 'absolute',
    right: 20,
    top: 8,
    backgroundColor: '#000',
    padding: 6,
    borderRadius: 16,
  },
});

export default ProfileAvatar;