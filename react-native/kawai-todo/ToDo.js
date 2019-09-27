// file: ToDo.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import PropTypes from 'prop-types';

const { width, height } = Dimensions.get("window");

// state 가 필요해서 class 로 작성
export default class ToDo extends React.Component {

    // 이렇게해야 바로 렌더 후 작업 가능
    constructor(props) {
        super(props);
        this.state = { 
            isEditing: false, 
            toDoValue: props.text}
    }

    static propTypes = {
        text: PropTypes.string.isRequired,
        isCompleted: PropTypes.bool.isRequired,
        deleteToDo: PropTypes.func.isRequired,
        id: PropTypes.string.isRequired,
        uncompleteToDo: PropTypes.func.isRequired,
        completeToDo: PropTypes.func.isRequired,
        updateToDo: PropTypes.func.isRequired
    }

    // 위의 constructor(props) 로 대체
    // state = {
    //     isEditing: false,
    //     // isCompleted: false,
    //     toDoValue: ""
    // };

    render(){

        const { isEditing, toDoValue } = this.state;
        const { text, id, deleteToDo, isCompleted } = this.props;

        return(
            <View style={styles.container}>
                <View style={styles.column}>
                    <TouchableOpacity onPress={this._toggleComplete}>
                        <View style={[
                            styles.circle, 
                            isCompleted ? styles.completedCircle : styles.uncompletedCircle
                            ]} />
                    </TouchableOpacity>
                    {isEditing ? (
                        <TextInput
                          style={[
                        // 아래 순서에 따라 앱 모양이 바뀌는..?
                          styles.text,
                          styles.input,    
                          isCompleted ? styles.completedText : styles.uncompletedText]}
                          value={toDoValue}
                          multiline={true}
                          onChangeText={this._controllInput}
                          returnKeyType={"done"} 
                          onBlur={this._finishEditing} // onBlur 는 다른 곳을 클릭했을 때 실행할 동작
                          underlineColorAndroid={"transparent"} // 안드로이드에서 밑줄 투명
                        />
                    ) : (
                        <Text style={[
                            styles.text, 
                            isCompleted ? styles.completedText : styles.uncompletedText
                            ]}>{text}
                        </Text>
                    )}
                </View>
                
                {isEditing ? (
                        <View style={styles.actions}>
                            <TouchableOpacity onPressOut={this._finishEditing}>
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>✅</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.actions}>
                            <TouchableOpacity onPressOut={this._startEditing}>
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>✏️</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPressOut={(event) => {event.stopPropagation; deleteToDo(id); }}>
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>❌</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                
            </View>
        );
    }
    
    _toggleComplete = (event) => {
        event.stopPropagation();
        const { isCompleted, uncompleteToDo, completeToDo, id } = this.props;
        if (isCompleted) {
            uncompleteToDo(id);
        } else {
            completeToDo(id);
        }
        // this.setState(prevState => {
        //     return {
        //         isCompleted: !prevState.isCompleted
        //     };
        // })
    };

    _startEditing = (event) => {
        event.stopPropagation();
        // const { text } = this. props;
        this.setState({
            isEditing: true,
            // toDoValue: text
        });
    };

    _finishEditing = (event) => {
        event.stopPropagation();
        const { toDoValue } = this.state;
        const { id, updateToDo } = this.props;

        updateToDo(id, toDoValue);
        this.setState({
            isEditing: false
        })
    };

    // (text) 와 text 둘 다 되네
    _controllInput = text => {
        this.setState({
            toDoValue: text
        });
    }

}

const styles = StyleSheet.create({
    container: {
        width: width - 50,
        borderBottomColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    circle: {
        width: 30,
        height: 30,
        // borderRadius 는 항상 width, height 의 절반이여야한다.
        borderRadius: 15,
        borderWidth: 3,
        marginRight: 20
    },
    completedCircle: {
        borderColor: '#bbb'
    },
    uncompletedCircle: {
        borderColor: '#F23657'
    },
    text: {
        fontWeight: '600',
        fontSize: 20,
        marginVertical: 20
    },
    completedText: {
        color: '#bbb',
        textDecorationLine: 'line-through'
    },
    uncompletedText: {
        color: 'red'
    },
    column: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width / 2,
    },
    actions: {
        flexDirection: 'row'
    },
    actionContainer: {
        // 마진을 주는 이유는 실제 클릭은 항상 주변까지 누를 수 있기에
        marginVertical: 10,
        marginHorizontal: 10
    },
    input: {
        marginVertical: 15,
        width: width / 2
    }
});