import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { addressDB } from '../dbs';
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
        width: Dimensions.get("window").width / 1.5,
        maxHeight: Dimensions.get("window").height / 1.5,
        backgroundColor: "#ffffff",
        borderRadius: 30,
        paddingTop: 10
    },
    modalItemContainer: {
        alignItems:"center", 
        marginBottom: 10
    },
    modalItemText: {
        fontSize:20
    }
})
class LiveInMyInfo extends Component {
    state = {
        address_0: "서울특별시",
        address_1: "강남구",
        address_0_modal: false,
        address_1_modal: false,
    }
    changeAddress_0 = (address_0) => {
        const user = store.getState().user;
        this.setState({
            address_0,
            address_1: addressDB[address_0][0],
            address_0_modal: false,
            address_1_modal: true
        })
        db.doc(`users/${user.docId}`).update({address_0, address_1: addressDB[address_0][0]})
        store.dispatch({ type: 'user', user: {...user, address_0, address_1: addressDB[address_0][0]}});
    }
    changeAddress_1 = (address_1) => {
        const user = store.getState().user;
        this.setState({
            address_1,
            address_1_modal: false
        })
        db.doc(`users/${user.docId}`).update({address_1})
        store.dispatch({ type: 'user', user: {...user, address_1 }});
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            address_0: user.address_0,
            address_1: user.address_1,
        })
    }
    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.label}>
                    지역
                </Text>
                <TouchableOpacity style={styles.content} onPress={() => this.setState({address_0_modal: true})}>
                    <Text style={styles.contentText}>
                        {this.state.address_0} {this.state.address_1}
                    </Text>
                    <OpenDataSetting keyword="address_open"/>
                </TouchableOpacity>
                <Modal 
                    visible={this.state.address_0_modal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={() => this.setState({address_0_modal: false})}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalInnerWindow}>
                            <ScrollView>
                                {Object.keys(addressDB).map((address_0, index) => {
                                    return(
                                        <TouchableOpacity 
                                            key={address_0 + index} 
                                            style={styles.modalItemContainer}
                                            onPress={() => this.changeAddress_0(address_0)}
                                        >
                                            <Text style={styles.modalItemText}>
                                                {address_0}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
                <Modal 
                    visible={this.state.address_1_modal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={() => this.setState({address_0_modal: true,address_1_modal: false})}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalInnerWindow}>
                            <ScrollView>
                                {addressDB[this.state.address_0].map((address_1, index) => {
                                    return(
                                        <TouchableOpacity 
                                            key={address_1 + index} 
                                            style={styles.modalItemContainer}
                                            onPress={() => this.changeAddress_1(address_1)}
                                        >
                                            <Text style={styles.modalItemText}>
                                                {address_1}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

export default LiveInMyInfo;