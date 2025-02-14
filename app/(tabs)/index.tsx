import { useState } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reportSummary, setReportSummary] = useState<string | null>(null);

  // Function to handle image selection
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Replaced deprecated option
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      processImage(imageUri);
    }
  };

  // Function to send image to FastAPI server for OCR & NLP
  const processImage = async (imageUri: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'report.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch('http://x.x.x.x:8000/extract-text/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      setReportSummary(data.summary);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze the report. Please try again.');
      console.error('Error processing image:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Upload your Report Below</ThemedText>
        <ThemedText>
          Make sure that your file is in <ThemedText type="defaultSemiBold">JPEG or PNG</ThemedText> format.
        </ThemedText>  
      </ThemedView>

      {/* Upload Button */}
      <View style={styles.uploadContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>Upload Report</Text>
        </TouchableOpacity>
      </View>

      {/* Display Uploaded Image */}
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
        </View>
      )}

      {/* Report Summary Section */}
      {reportSummary && (
        <ThemedView style={styles.summaryContainer}>
          <ThemedText style={{color:'black', fontSize:12,fontWeight:500 }}>Report Summary</ThemedText>
          <ThemedText style={{color:'black', fontSize:12,}}>{reportSummary}</ThemedText>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  uploadContainer: {
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  uploadButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    marginVertical: 10,
  },
  uploadedImage: {
    width: 325,
    height: 200,
    borderRadius: 10,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  reactLogo: {
    height: 250,
    width: 400,
    position: 'absolute',
  },
});
