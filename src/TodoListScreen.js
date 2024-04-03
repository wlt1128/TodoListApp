import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Text, FlatList, TouchableOpacity, Image, Alert, location } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
export default function TodoListScreen({ navigation }) {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [location, setLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  useEffect(() => {
    // 初始化应用的异步操作
    const initApp = async () => {
      // 请求媒体库权限
      const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraRollStatus.status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }

      // 请求位置权限
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      if (locationStatus.status !== 'granted') {
        alert('Sorry, we need location permissions to make this work!');
      } else {
        // 获取并设置当前位置
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      }

      // 加载存储的任务
      try {
        const storedTasksString = await AsyncStorage.getItem('tasks');
        const storedTasks = storedTasksString ? JSON.parse(storedTasksString) : [];
        setTasks(storedTasks);

        // 计算标记的日期，适用于你的日历逻辑
        const marked = storedTasks.reduce((acc, current) => {
          const formattedDate = current.date; // 假设每个 todo 项中都有一个格式为 "yyyy-mm-dd" 的 date 属性
          if (formattedDate) {
            acc[formattedDate] = { marked: true, dotColor: 'blue', activeOpacity: 0.5 };
          }
          return acc;
        }, {});
        setMarkedDates(marked);
      } catch (err) {
        console.error(err);
      }
    };

    initApp();
  }, []);



  // 切换日历显示的函数
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleSelectImage = () => {
    Alert.alert('Upload Image', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhotoHandler },
      { text: 'Choose from Gallery', onPress: pickImageHandler },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const takePhotoHandler = async () => {
    // 确保已经获得相机权限
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('You have refused to allow this app to access your camera!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled && result.assets) {
      setImage(result.assets[0].uri);
      console.log('Photo taken, imageUri:', result.assets[0].uri);
    }
  };

  const pickImageHandler = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled && result.assets) {
      setImage(result.assets[0].uri);
      console.log('Image selected, imageUri:', result.assets[0].uri);
    } else if (!result.cancelled) {
      setImage(result.uri);
      console.log('Image selected, uri:', result.uri);
    }
  };

  const handleAddTask = async () => {
    if (task.trim() === '') {
      alert('Please enter a task');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    const newTask = {
      id: Date.now().toString(),
      text: task,
      completed: false,
      image: image,
      location: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      },
      date: new Date().toISOString().slice(0, 10),
    };

    const updatedTasks = [...tasks, newTask];

    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      setTask('');
      setImage(null);

      // 这里使用 setTimeout 来模拟长时间的操作
      navigation.navigate('MapScreen', { todos: updatedTasks });
    } catch (err) {
      console.log(err);
    }
  };


  const handleDeleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks); // 更新状态
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks)); // 更新本地存储
    } catch (err) {
      console.error('Error updating tasks after deletion:', err); // 错误处理
    }
  };

  const handleCompleteTask = (id) => {
    setTasks(tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  // 在这里输出每个任务项的详细信息
  const handleEdit = (id) => {
    const taskToEdit = tasks.find(task => task.id === id);
    setIsEditing(true);
    setCurrentTask(taskToEdit);
  };
  const handleSaveEdit = () => {
    const updatedTasks = tasks.map(task => {
      if (task.id === currentTask.id) {
        return { ...task, text: currentTask.text };
      }
      return task;
    });

    setTasks(updatedTasks);
    setIsEditing(false);
    setCurrentTask({});

    // 更新本地存储
    try {
      AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (err) {
      console.error(err);
    }
  };

  const renderTaskItem = ({ item }) => {
    // 如果正在编辑此任务
    if (isEditing && currentTask.id === item.id) {
      return (
        <View style={styles.taskItem}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setCurrentTask({ ...currentTask, text })}
            value={currentTask.text}
          />
        <TouchableOpacity style={styles.customButton} onPress={handleSaveEdit}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        </View>
      );
    } else {
      // 正常显示任务
      return (
        <View style={styles.taskItem}>
          <View style={styles.taskTextAndImage}>
            <Text style={item.completed ? styles.taskTextCompleted : styles.taskText}>{item.text}</Text>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
          </View>

          {item.location && (
            <View style={styles.locationContainer}>
              <Text style={styles.taskLocation}>Location: {item.location.latitude}, {item.location.longitude}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.touchableButton}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.touchableButton}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCompleteTask(item.id)} style={styles.touchableButton}>
              <Text style={styles.buttonText}>{item.completed ? 'Mark as Incomplete' : 'Mark as Complete'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCalendar} style={styles.touchableButton}>
              <Text style={styles.buttonText}>Show Calendar</Text>
            </TouchableOpacity>
          </View>
          {showCalendar && (
            <Calendar
              markedDates={markedDates}
            />
          )}
        </View>
      );  
    }
  };



  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What needs to be done?"
          value={task}
          onChangeText={setTask}
        />
        <View style={styles.imageAndButtonContainer}>
          {image && (
            <Image source={{ uri: image }} style={styles.thumbnail} />
          )}
          <View style={styles.buttonContainer1}>
            <TouchableOpacity onPress={handleSelectImage} style={styles.button}>
              <Text style={styles.buttonText}>Pick Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddTask} style={styles.button}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'All' ? { backgroundColor: '#ba8888' } : {}]} 
          onPress={() => setFilter('All')} 
          activeOpacity={0.7}>
          <Text style={filter === 'All' ? styles.filterTextSelected : styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'Active' ? { backgroundColor: '#ba8888' } : {}]} 
          onPress={() => setFilter('Active')} 
          activeOpacity={0.7}>
          <Text style={filter === 'Active' ? styles.filterTextSelected : styles.filterText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'Completed' ? { backgroundColor: '#ba8888' } : {}]} 
          onPress={() => setFilter('Completed')} 
          activeOpacity={0.7}>
          <Text style={filter === 'Completed' ? styles.filterTextSelected : styles.filterText}>Completed</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eedbdb',
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'column', // 切换为垂直布局
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // 根据线框图底部边框颜色调整
  },
  imageAndButtonContainer: {
    flexDirection: 'row', // 图片和按钮的水平布局
    alignItems: 'center', // 垂直居中
    justifyContent: 'space-between', // 两边对齐
    paddingTop: 10, // 与输入框的间隔
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0', // 根据线框图文本框边框颜色调整
    backgroundColor: '#ffffff', // 文本框背景色设为白色
    borderRadius: 5,
    padding: 10,
    fontSize: 18, // 文本大小调整为适中
    marginBottom: 10, // 添加一些底部边距
  },
  buttonContainer1: {
    flexDirection: 'column', // 按钮垂直排列
    justifyContent: 'space-between', // 按钮之间的间隔
  },
  thumbnail: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },



  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // 此属性确保所有子项之间的间距相等
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  filterButton: {
    flex: 1, // 这将确保每个按钮都平均占据空间
    alignItems: 'center', // 将按钮文本居中对齐
    
  },
  filterText: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 5, // 可以根据需要调整，以适应屏幕大小
    borderRadius: 5,
  },
  filterTextSelected: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 5, // 同上
    borderRadius: 5,
    backgroundColor: '#ba8888', // 被选中时的背景颜色
    color: 'black', // 被选中时的文本颜色
  },





  taskItem: {
    flexDirection: 'column', // 改为垂直布局
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#eedbdb',
  },
  taskTextAndImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  taskText: {
    // 根据需要调整样式，确保与图片在同一行
    fontSize: 18,
    color: 'black',
    flexShrink: 1, // 允许文本在必要时缩小
    marginRight: 10,
  },
  taskTextCompleted: {
    // 同上，确保样式一致
    textDecorationLine: 'line-through',
    color: 'grey',
    flexShrink: 1,
    marginRight: 10,
  },
  image: {
    // 调整图片大小以匹配线框图
    width: 150,
    height: 150,
    borderRadius: 5,
  },
  locationContainer: {
    // 新增位置文本的容器
    marginTop: 5,
  },
  taskLocation: {
    fontSize: 12,
    color: 'grey',
  },
  buttonContainer: {
    // 按钮容器样式调整
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10, // 在图片和按钮之间添加空间
  },
  touchableButton: {
    backgroundColor: '#d7b2b2', // 按钮背景颜色
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },






  // 新增自定义按钮样式
  customButton: {
    backgroundColor: '#d7b2b2', // 你可以选择一个你喜欢的颜色
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // 仅在安卓上显示阴影效果
    marginHorizontal: 5,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#d7b2b2', // 或者任何您想要的颜色
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20, // 圆角的大小，使按钮看起来更像是圆角的
    marginVertical: 5, // 如果需要的话，您可以调整垂直间距
    alignItems: 'center', // 文字居中对齐
    justifyContent: 'center', // 在按钮内部垂直居中
    minWidth: 100, // 按钮的最小宽度，根据您的布局需要进行调整
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
  },
});
