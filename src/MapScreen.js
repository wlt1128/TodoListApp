import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapScreen({ route }) {
  // 假设传递的是包含所有todo项的数组，而不是单个location和text
  const todos = route.params?.todos || [];

  // 设置初始区域，这里简单地设为第一个todo的位置
  // 实际应用中可能需要计算所有标记的中心点或使用不同的逻辑
  const initialRegion = todos.length > 0 ? {
    latitude: todos[0].location.latitude,
    longitude: todos[0].location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : null;

  return (
    <View style={styles.container}>
      {initialRegion ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
        >
          {todos.map((todo, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: todo.location.latitude, longitude: todo.location.longitude }}
              title={todo.text}
              description={todo.text}
            />
          ))}
        </MapView>
      ) : (
        <Text>No todos to display</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
