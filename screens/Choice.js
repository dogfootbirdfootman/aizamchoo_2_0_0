import React, { Component } from 'react';
import { View, Text, Dimensions, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import store from '../store';
import fb from '../fb';

const db = fb.firestore();
const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: "center"
    },
    textContainer: {
        padding:10
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
    itemsContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        paddingTop: 20, 
        paddingHorizontal: 10
    },
    itemContainer: {
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 20,
        marginBottom: 10
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
class Choice extends Component {
    state={
        choicedIndex: []
    }
    toggle = (index) => {
        const indexList = this.state.choicedIndex;

        if(indexList.includes(index)){
            indexList.splice(indexList.indexOf(index), 1)
            this.setState({
                choicedIndex: indexList
            })
        }else if(this.props.route.params.maxCount > indexList.length){
            indexList.push(index)
            this.setState({
                choicedIndex: indexList
            })
        }
    }
    save = () => {
        const array = this.state.choicedIndex.map((item, index) => {
            return this.props.route.params.resource[item]
        })
        const user = store.getState().user;
        const updateUser = {
            ...user,
            [this.props.route.params.keyword] : array
        }
        const updatedb = {
            [this.props.route.params.keyword] : array
        }
        store.dispatch({ type: 'user', user: updateUser});
        db.doc(`users/${user.docId}`).update(updatedb).then((res) => this.props.navigation.goBack())
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
                        {this.state.choicedIndex.length} 개 / 최대 {this.props.route.params.maxCount} 개
                    </Text>
                </View>
                <ScrollView>
                    <View style={styles.itemsContainer}>
                        {this.props.route.params.resource.map((item, index) => {
                            return(
                                <TouchableOpacity 
                                    key={item+index}
                                    style={[
                                        styles.itemContainer, 
                                        { 
                                            backgroundColor: this.state.choicedIndex.includes(index) ? 
                                                "skyblue"
                                            : 
                                                "white" 
                                        }
                                    ]} 
                                    onPress={() => this.toggle(index)}
                                >
                                    <Text>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </ScrollView>
                <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Text style={styles.bottomButtonText}>
                            뒤로가기
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.save}>
                        <Text style={styles.bottomButtonText}>
                            저장
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

export default Choice;