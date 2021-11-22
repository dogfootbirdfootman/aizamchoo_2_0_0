import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from "react-native";
import store from '../store';
import fb from '../fb';
import OpenDataSetting from "./OpenDataSetting";
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
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 30
    },
    modalTitleContainer: {
        alignItems: 'center',
        marginBottom: 10
    },
    modalTitleText: {
        fontSize: 30
    },
    modalTextInputsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10
    },
    modalTextInput: {
        width: 30,
        height: 30,
        marginRight: 5,
        borderColor: "black",
        borderWidth: 1,
        fontSize: 20
    },
    modalTextInputSideText: {
        fontSize: 24,
        marginRight: 5
    },
    modalButtonContainer: {
        alignItems: 'center'
    },
    modalButton: {
        backgroundColor: "#4777ff",
        paddingVertical: 5,
        paddingHorizontal:30,
        alignItems: "center",
        borderRadius: 10
    },
    modalButtonText: {
        fontSize: 20,
        color: "white"
    },
    modalAlertContainer: {
        alignItems:"center",
        marginTop: 10
    },
    modalAlertText: {
        fontSize: 18,
        color: "red"
    }
})
class FamilyMyInfo extends Component {
    state = {
        family: null,
        family_modal: false,
        familyOne: '',
        familyTwo: '',
        familyThree: '',
        familyAlert: '',
    }
    onFamilyOne = (familyOne) => {
        this.setState({
            familyOne
        })
    }
    onFamilyTwo = (familyTwo) => {
        this.setState({
            familyTwo
        })
    }
    onFamilyThree = (familyThree) => {
        this.setState({
            familyThree
        })
    }
    familySave = () => {
        const { familyOne , familyTwo, familyThree } = this.state;
        if(familyOne === '' || familyTwo === '' || familyThree === ''){
            this.setState({
                familyAlert: "빈칸 없이 입력해주세요."
            })
        }else{
            const family = familyOne + familyTwo + familyThree;
            this.setState({
                family,
                familyAlert: '',
                familyOne: '',
                familyTwo: '',
                familyThree: '',
            }, () => this.setState({family_modal: false}))
            const user = store.getState().user;
            db.doc(`users/${user.docId}`).update({family})
            store.dispatch({ type: 'user', user: {...user, family }});
        }
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            family: user.family
        })
    }
    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.label}>
                    가족관계
                </Text>
                <TouchableOpacity style={styles.content} onPress={() => this.setState({family_modal: true})}>
                    {
                        this.state.family === null ?
                            <Text style={styles.contentText}>
                                미입력
                            </Text>
                        :
                            <Text style={styles.contentText}>
                                {this.state.family[0]} 남 {this.state.family[1]} 녀 중 {this.state.family[2]}째
                            </Text>
                    }
                    <OpenDataSetting keyword="family_open"/>
                </TouchableOpacity>
                <Modal 
                    visible={this.state.family_modal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={() => this.setState({family_modal: false})}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalInnerWindow}>
                            <View style={styles.modalTitleContainer}>
                                <Text style={styles.modalTitleText}>
                                    가족관계
                                </Text>
                            </View>
                            <View style={styles.modalTextInputsContainer}>
                                <TextInput 
                                    style={styles.modalTextInput}
                                    onChangeText={familyOne => this.onFamilyOne(familyOne)}
                                    value={this.state.familyOne}
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    maxLength={10}
                                    textAlign="center"
                                    keyboardType="number-pad"
                                /> 
                                <Text style={styles.modalTextInputSideText}>남</Text>
                                <TextInput 
                                    style={styles.modalTextInput}
                                    onChangeText={familyTwo => this.onFamilyTwo(familyTwo)}
                                    value={this.state.familyTwo}
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    maxLength={10}
                                    textAlign="center"
                                    keyboardType="number-pad"
                                /> 
                                <Text style={styles.modalTextInputSideText}>녀  중</Text> 
                                <TextInput 
                                    style={styles.modalTextInput}
                                    onChangeText={familyThree => this.onFamilyThree(familyThree)}
                                    value={this.state.familyThree}
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    maxLength={10}
                                    textAlign="center"
                                    keyboardType="number-pad"
                                /> 
                                <Text style={styles.modalTextInputSideText}>째</Text>
                            </View>
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity 
                                    style={styles.modalButton}
                                    onPress={() => this.familySave()}
                                >
                                    <Text style={styles.modalButtonText}>
                                        저장
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalAlertContainer}>
                                <Text style={styles.modalAlertText}>
                                    {this.state.familyAlert}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

export default FamilyMyInfo;