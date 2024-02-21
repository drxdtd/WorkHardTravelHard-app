import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto, AntDesign } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const MODE_KEY = "@mode";

export default function App() {
  const [isWorking, setIsWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);

  const onChangeText = (payLoad) => setText(payLoad);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const saveMode = async (mode) => {
    console.log(mode);
    if (mode === "work") {
      setIsWorking(true);
    } else {
      setIsWorking(false);
    }
    await AsyncStorage.setItem(MODE_KEY, mode);
  };

  const loadMode = async () => {
    const savedMode = await AsyncStorage.getItem(MODE_KEY);
    if (savedMode !== null) {
      setIsWorking(savedMode === "work");
    }
  };

  const loadToDos = async () => {
    const localToDos = await AsyncStorage.getItem(STORAGE_KEY);
    if (localToDos !== null) {
      setToDos(JSON.parse(localToDos));
    }
    setLoading(false);
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working: isWorking, completed: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
  };
  const completeToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const toDoKeyArray = Object.keys(toDos);

  return loading ? (
    <View style={styles.container} justifyContent="center">
      <ActivityIndicator size={"large"} />
    </View>
  ) : (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => saveMode("work")}>
          <Text
            style={{
              ...styles.btnText,
              color: isWorking ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => saveMode("travel")}>
          <Text
            style={{
              ...styles.btnText,
              color: !isWorking ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        returnKeyType="done"
        placeholder={isWorking ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      ></TextInput>
      <ScrollView>
        {toDoKeyArray.map((key) => {
          const item = toDos[key];
          return toDos[key].working === isWorking ? (
            <View style={styles.toDo} key={key}>
              <Text
                style={{
                  ...styles.toDoText,
                  textDecorationLine: item.completed ? "line-through" : "none",
                }}
              >
                {toDos[key].text}
              </Text>

              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => completeToDo(key)}>
                <Fontisto
                  name={`checkbox-${item.completed ? "active" : "passive"}`}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <AntDesign name="edit" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ) : null;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
    textDecorationLine: "line-through",
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
