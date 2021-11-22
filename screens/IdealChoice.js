import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import store from '../store';
import fb from '../fb';
const db = fb.firestore();

class IdealChoice extends Component {
    state = {
        list: [],
        choicedlist: []
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            list: this.props.route.params.resource,
            choicedlist: user[this.props.route.params.keyword]
        })
    }
    toggleItem = (choiced, index) => {
        if(choiced === -1){
            this.setState((prevState) => {
                return({
                    choicedlist: [...prevState.choicedlist, this.props.route.params.resource[index]]
                })
            })
        }else {
            const dupList = [...this.state.choicedlist];
            dupList.splice(choiced, 1)
            this.setState({
                choicedlist: dupList
            })
        }
    }
    clear = () => {
        this.setState({
            choicedlist: []
        })
    }
    save = () => {
        const user = store.getState().user;
        store.dispatch({ type: 'user', user: {...user, [this.props.route.params.keyword]: this.state.choicedlist}});
        db.doc(`users/${user.docId}`).update({[this.props.route.params.keyword]: this.state.choicedlist})
        this.props.navigation.goBack()
    }
    render(){
        return(
            <View style={styles.container}>
                <ScrollView>
                    <View style={styles.itemsContainer}>
                        {this.state.list.length !== 0 ? 
                            this.state.list.map((item, index) => {
                                const choiced = this.state.choicedlist.indexOf(item)
                                return(
                                    <TouchableOpacity key={item+index} style={[styles.itemContainer, {backgroundColor: choiced === -1 ? "white" : "skyblue"}]} onPress={() => this.toggleItem(choiced, index)}>
                                        <Text>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })
                        : null}
                        <TouchableOpacity 
                            style={[styles.itemContainer, {backgroundColor: this.state.choicedlist.length === 0 ? "skyblue" : "white"}]} 
                            onPress={this.clear}>
                            <Text>
                                상관없음
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnContainer} onPress={() => this.props.navigation.goBack()}>
                        <Text style={styles.btnText}>
                            취소
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnContainer} onPress={this.save}>
                        <Text style={styles.btnText}>
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
        justifyContent: "flex-end"
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
    btnsContainer: {
        width: Dimensions.get("window").width,
        borderTopWidth: 1,
        borderTopColor: "#dddddd",
        flexDirection: 'row',
        justifyContent: "space-evenly",
        paddingVertical: 20
    },
    btnContainer: {

    },
    btnText: {
        fontSize: 20
    }
})

export default IdealChoice;