import React, { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, ScrollView, Keyboard } from 'react-native';
import store from '../store';
import fb from '../fb';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const db = fb.firestore();

class WriteList extends Component {
    state = {
        list: [],
        text: ''
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            list: user[this.props.route.params.keyword]
        })
    }
    onChangeText = (text) => {
        this.setState({
            text
        })
    }
    spliceList = (index) => {
        const dupArray = [...this.state.list];
        dupArray.splice(index, 1);
        this.setState({
            list: dupArray
        })
        const user = store.getState().user;
        store.dispatch({ type: 'user', user: {...user, [this.props.route.params.keyword]: dupArray }});
        db.doc(`users/${user.docId}`).update({[this.props.route.params.keyword]: dupArray})
    }
    pushList = () => {
        Keyboard.dismiss()
        if(this.state.text !== "" && this.state.list.length < this.props.route.params.maxCount){
            const newList = [...this.state.list, this.state.text];
            this.setState({
                list: newList,
                text: ""
            })
            const user = store.getState().user;
            store.dispatch({ type: 'user', user: {...user, [this.props.route.params.keyword]: newList }});
            db.doc(`users/${user.docId}`).update({[this.props.route.params.keyword]: newList})
        }else if(this.state.text !== "" && this.state.list.length === this.props.route.params.maxCount){
            alert(`최대 ${this.props.route.params.maxCount} 개를 초과 할수 없습니다.`)
        }
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    {this.props.route.params.textArray ? 
                        this.props.route.params.textArray.map((text, index) => {
                            return(
                                <Text style={styles.text} key={text+index}>
                                    {text}
                                </Text>
                            )
                        })
                    : 
                        null
                    }
                </View>
                <View style={styles.countContainer}>
                    <Text style={styles.countText}>
                        {this.state.list.length} 개 / 최대 {this.props.route.params.maxCount} 개
                    </Text>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.textInput}
                        onChangeText={this.onChangeText}
                        value={this.state.text}
                        autoCompleteType="off"
                        autoCorrect={false}
                        textAlign="left"
                        keyboardType="default"
                        paddingHorizontal={10}
                    />
                    <TouchableOpacity onPress={this.pushList}>
                        <MaterialCommunityIcons name="pencil-plus-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.scrollView}>
                    {
                        this.state.list.map((item, index) => {
                            return(
                                <View 
                                    key={item + index} 
                                    style={styles.itemContainer}
                                >
                                    <Text style={styles.itemText}>
                                        {index+ 1}. {item}
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.itemIconContainer}
                                        onPress={() => this.spliceList(index)}
                                    >
                                        <MaterialCommunityIcons name="pencil-minus-outline" size={24} color="black" />
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                    }
                </ScrollView>
                <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack()
                    }}>
                        <Text style={styles.bottomButtonText}>
                            뒤로가기
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.pushList}>
                        <Text style={styles.bottomButtonText}>
                            저장
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: "center"
    },
    textContainer: {
        padding:10,
    },
    text: {
        fontSize: 20
    },
    countContainer: {
        width: Dimensions.get("window").width,
        flexDirection: "row", 
        justifyContent: "flex-end"
    },
    countText: {
        fontSize: 18, 
        marginRight: 10
    },
    inputContainer: {
        flexDirection: "row",
        justifyContent:"space-between",
        width: Dimensions.get("window").width,
        padding: 20
    },
    textInput: {
        width: Dimensions.get("window").width/1.3,
        height: 30,
        borderColor: "black",
        borderWidth: 1,
        fontSize: 20
    },
    scrollView: {
        width: Dimensions.get("window").width,
        padding: 10
    },
    itemContainer: {
        borderBottomColor: "#cccccc",
        borderBottomWidth: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: "space-between"
    },
    itemText: {
        fontSize:20, flex: 9
    },
    itemIconContainer: {
        flex: 1,
        justifyContent:"center", 
        alignItems: "center"
    },
    bottomButtonsContainer: {
        width: Dimensions.get("window").width,
        borderTopWidth: 1,
        borderTopColor: "#dddddd",
        flexDirection: 'row',
        justifyContent: "space-evenly",
        paddingVertical: 20
    },
    bottomButtonText: {
        fontSize: 20
    }
})
export default WriteList;                                
