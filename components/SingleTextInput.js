import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, TextInput } from 'react-native';
import fb from '../fb';
import store from '../store';
import OpenDataSetting from './OpenDataSetting';

const db = fb.firestore();
const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        paddingBottom: 10,
        flexDirection: "row",
        borderBottomWidth: 2,
        borderColor: "#cccccc"
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1
    },
    content: {
        marginLeft: 20,
        flex: 3,
        flexDirection: "row"
    },
    contentText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4630eb"
    },
    icon: {
        marginLeft: 20
    },
    modalContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#90909082"
    },
    modalInnerWindow: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        padding: 30
    },
    modalTitleContainer: {
        marginBottom: 10
    },
    modalTitleText: {
        fontSize: 24,
        fontWeight: "bold"
    },
    modalTextInput: {
        width: Dimensions.get('window').width/2,
        fontSize: 24,
        borderRadius: 10,
        padding: 5,
        backgroundColor: "#dddddd",
        marginBottom: 10
    },
    modalButton: {
        width: Dimensions.get('window').width/2,
        backgroundColor: "#4777ff",
        padding: 5,
        alignItems: "center",
        borderRadius: 10
    },
    modalButtonText: {
        fontSize: 20, 
        color: "white"
    }
})
class SingleTextInput extends Component {
    state = {
        modal: false,
        text: ''
    }
    cancel = () => {
        const user = store.getState().user;
        this.setState({
            modal: false,
            text: user[this.props.keyword]
        })
    }
    onChangeText = (text) => {
        this.setState({
            text
        })
    }
    save = () => {
        this.setState({
            modal: false
        })
        const user = store.getState().user;
        const { text } = this.state;
        db.doc(`users/${user.docId}`).update({[this.props.keyword]: text})
        store.dispatch({ type: 'user', user: {...user, [this.props.keyword]: text }});
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            text: user[this.props.keyword]
        })
    }
    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.label}>
                    {this.props.title}
                </Text>
                <TouchableOpacity 
                    style={styles.content} 
                    onPress={() => this.setState({modal: true})}
                >
                    <Text style={styles.contentText}>
                        {this.state.text}
                    </Text>
                    <OpenDataSetting keyword={this.props.keyword + "_open"}/>
                </TouchableOpacity>
                <Modal 
                    visible={this.state.modal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={this.cancel}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalInnerWindow}>
                            <View style={styles.modalTitleContainer}>
                                <Text style={styles.modalTitleText}>
                                    {this.props.title}
                                </Text>
                            </View>
                            <TextInput
                                style={styles.modalTextInput}
                                onChangeText={this.onChangeText}
                                value={this.state.text}
                                autoCompleteType="off"
                                autoCorrect={false}
                                maxLength={10}
                                placeholderTextColor="darkgray"
                                textAlign="center"
                                keyboardType="default"
                            />
                            <TouchableOpacity 
                                style={styles.modalButton}
                                onPress={this.save}
                            >
                                <Text style={styles.modalButtonText}>
                                    저장
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

export default SingleTextInput;