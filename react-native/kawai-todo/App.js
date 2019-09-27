// file: App.js

import React from 'react';
import { StyleSheet, Text, View, StatusBar, TextInput, Dimensions, Platform, ScrollView, AsyncStorage } from 'react-native';
import ToDo from './ToDo';
import { AppLoading } from 'expo';
import uuidv1 from 'uuid/v1';

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {

  state = {
    newToDo: "", // 새로 작성하는 리스트
    loadedToDos: false, // 로딩이 끝나야 앱 불러오기 위한
    toDos: {} // 리스트들 저장소
  };

  // 컴포넌트가 끝나야 로딩
  componentDidMount = () => {
    this._loadToDos();
  }

  render() {

    const { newToDo, loadedToDos, toDos } = this.state;
    console.log(toDos);
    if(!loadedToDos){ // ToDos 리스트가 로딩되지 않으면 AppLoading 을 불러온다.
      return <AppLoading></AppLoading>;
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content"/>
        <Text style={styles.title}>Mar To Do</Text>
        <View style={styles.card}>
          <TextInput 
            style={styles.input} 
            placeholder={"New To Do"} 
            placeholderTextColor={'#999'}
            value={newToDo} // newToDo 의 값을 value 로 지정
            onChangeText={this._controlNewToDo} // 글자를 쓰는 순간 _controlNewToDo 실행
            returnKeyType={"done"} // 한 줄에 쓸거라 엔터키가 'done'으로 표시
            autoCorrect={false} // 자동고침 없애기
            onSubmitEditing={this._addToDo} // submit 버튼이 눌렸을 때
            underlineColorAndroid={"transparent"} // 안드로이드에서 밑줄 투명
          />
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos).reverse().map(toDo => (
              <ToDo 
                key={toDo.id} 
                {...toDo} 
                deleteToDo={this._deleteToDo}
                uncompleteToDo={this._uncompleteToDo}
                completeToDo={this._completeToDo}
                updateToDo={this._updateToDo}
              />
            ))}
          </ScrollView> 
        </View>
      </View>
    );
  }

  // 글자가 쓰이는 순간
  _controlNewToDo = text => { // text 를 가져와서
    this.setState({
      newToDo: text // newToDo 에 값 넣기
    });
  };

  _loadToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem("toDos"); // 디스크에 저장
      const parsedToDos = JSON.parse(toDos);
      this.setState({
        loadedToDos: true, 
        toDos: parsedToDos || {} // 처음 실행하면 없기에 {} 도 한다.
      });
    } catch(err) {
      console.log('err: ', err);
    }
  };

  // 리스트 추가할 때
  _addToDo = () => {
    const { newToDo } = this.state;
    // newToDo 에 뭔가 적혀있다면
    if(newToDo !== ""){
      this.setState(prevState => {
        // prevState:  Object {
        //   "loadedToDos": true,
        //   "newToDo": "입력 값",
        //   "toDos": Object {},
        // } 
        const ID = uuidv1(); // ID 생성
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createdAt: Date.now()
          }
        };

        const newState = {
          ...prevState,
          newToDo: "",
          toDos: {
            ...prevState.toDos,
            ...newToDoObject // 이거 주석처리하면 값 입력이 안됨 근데 위에건 주석처리해도 되네..?
          }
        };

        // newState:  Object {
        //   "loadedToDos": true,
        //   "newToDo": "",
        //   "toDos": Object {
        //     "daa7cf50-df4c-11e9-993c-53ab335ff4b4": Object {
        //       "createdAt": 1569385679045,
        //       "id": "daa7cf50-df4c-11e9-993c-53ab335ff4b4",
        //       "isCompleted": false,
        //       "text": "입력 값",
        //     },
        //   },
        // }
        this._saveToDos(newState.toDos);
        return { ...newState };
      })
    }
  };

  // 리스트 삭제할 때
  _deleteToDo = id => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      // const toDos = this.state.toDos; 이것도 되긴 한데.. 같은 의미인가
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };
  
  // 완료되지 않은 목록들
  _uncompleteToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    })
  };

  // 완료된 목록들
  _completeToDo = id => {
    this.setState(prevState => {
      console.log('prevState: ', prevState);
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    })
  };

  // 리스트 수정
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    }); 
  };

  _saveToDos = newToDos => { // 데이터에 저장하기 위한 함수
    // console.log(JSON.stringify(newToDos));
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F23657',
    alignItems: 'center',
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "200",
    marginTop: 50,
    marginBottom: 30
  },
  card: {
    backgroundColor: 'white',
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(50, 50, 50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          widht: 0
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: "#bbb",
    borderBottomWidth: 1,
    fontSize: 25
  },
  toDos: {
    alignItems: "center"
  }

});