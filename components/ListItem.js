import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import store from '../store';
import fb from '../fb';

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
    titleText: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1
    },
    listContainer: {
        marginLeft: 20,
        flex: 3,
        flexDirection: "row"
    },
    listItemText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#90909082"
    },
    modalInnerWindow: {
        width: Dimensions.get("window").width / 1.5,
        maxHeight: Dimensions.get("window").height / 1.5,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20
    },
    modalScrollView: {
        width: Dimensions.get("window").width / 1.5,
        paddingTop: 5
    },
    modalItemContainer: {
        marginBottom: 10
    },
    modalItemText: {
        textAlign: 'center',
        fontSize: 20
    }
})
class ListItem extends Component {
    state = {
        modal: false
    }
    click = () => {
        if(this.props.modifiable){
            if(this.props.type === 'modal'){
                this.setState({
                    modal: true
                })
            }else if(this.props.type === 'choice'){
                const { title, keyword, maxCount, resource, textArray } = this.props;
                this.props.navigation?.navigate('Choice', { title, keyword, maxCount, resource, textArray })
            }else if(this.props.type === 'write'){
                const { title, keyword, maxCount, textArray } = this.props;
                this.props.navigation?.navigate('Write', { title, keyword, maxCount, textArray })
            }else if(this.props.type === 'idealChoice'){
                const { title, keyword, resource } = this.props;
                this.props.navigation?.navigate('IdealChoice', { title, keyword, resource })
            }
        }
    }
    modalChoice = (item) => {
        this.setState({modal: false})
        const user = store.getState().user;
        db.doc(`users/${user.docId}`).update({[this.props.keyword]: item})
        store.dispatch({ type: 'user', user: {...user, [this.props.keyword]: item}});
    }
    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.titleText}>
                    {this.props.title}
                </Text>
                <TouchableOpacity 
                    style={styles.listContainer}
                    onPress={this.click}
                >
                    <View>
                        {
                            this.props.items === null ? 
                                <Text 
                                    style={[
                                        styles.listItemText,
                                        {color: this.props.modifiable ? "#4630eb" : "black"}
                                    ]}
                                >
                                    {this.props.type === 'idealChoice' ? '상관없음' : '미입력' }
                                </Text> 
                            :
                                Array.isArray(this.props.items) ? 
                                    this.props.items.length === 0 ? 
                                        <Text 
                                            style={[
                                                styles.listItemText,
                                                {color: this.props.modifiable ? "#4630eb" : "black"}
                                            ]}
                                        >
                                            {this.props.type === 'idealChoice' ? '상관없음' : '미입력' }
                                        </Text>
                                    :
                                        this.props.items.map((item, index) => {
                                            return(
                                                <Text 
                                                    style={[
                                                        styles.listItemText,
                                                        {color: this.props.modifiable ? "#4630eb" : "black"}
                                                    ]} 
                                                    key= {index}
                                                >
                                                    {item}
                                                </Text>
                                            )
                                        })
                                : 
                                    <Text style={[
                                        styles.listItemText,
                                        {color: this.props.modifiable ? "#4630eb" : "black"}
                                    ]}>
                                        {this.props.items}
                                    </Text>
                        }
                    </View>
                    {this.props.type === "idealChoice" ? null : <OpenDataSetting keyword={this.props.keyword + "_open"}/>}
                </TouchableOpacity>
                <Modal
                    visible={this.state.modal}
                    animationType={'fade'} 
                    transparent={true}
                    onRequestClose={() => this.setState({modal: false})}
                >
                    
                        <View style={styles.modalContainer}>
                            <View style={styles.modalInnerWindow}>
                                <ScrollView style={styles.modalScrollView}>
                                    {this.props.resource ? 
                                        this.props.resource.map((item, index) => {
                                            return(
                                                <TouchableOpacity 
                                                    key={item + index} 
                                                    style={styles.modalItemContainer}
                                                    onPress={()=> this.modalChoice(item)}
                                                >
                                                    <Text style={styles.modalItemText}>
                                                        {item}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    :
                                        null}
                                </ScrollView>
                            </View>
                            
                        </View>
                    
                </Modal>
            </View>
        )
    }
}

export default ListItem;