import React, { Component } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addressDB, somoimCategoryDB } from '../dbs';
import { TouchableOpacity } from 'react-native-gesture-handler';
import fb from '../fb';
import firebase from 'firebase/app';
import store from '../store';
const db = fb.firestore();
const styles = StyleSheet.create({
    container: {
        padding: 10
    },
    addressContainer: {
        flexDirection: 'row', marginBottom: 10
    },
    addressLabelContainer: {
        flex: 1, 
        justifyContent: 'center', 
        paddingLeft: 10
    },
    addressLabelText: {
        fontSize: 20
    },
    addressPickerContainer: {
        flex: 2, 
        padding: 10, 
        backgroundColor: '#dddddd', 
        borderRadius: 10
    },
    address_0_picker: {
        marginBottom: 10
    },
    categoryContainer: {
        flexDirection: 'row', 
        marginBottom: 10
    },
    categoryLabelContainer: {
        flex: 1, 
        justifyContent: 'center', 
        paddingLeft: 10
    },
    categoryLabelText: {
        fontSize: 20
    },
    categoryPickerContainer: {
        flex: 2, 
        padding: 10, 
        backgroundColor: '#dddddd', 
        borderRadius: 10
    },
    nameContainer: {
        flexDirection: 'row', 
        marginBottom: 10
    },
    nameLabelContainer: {
        flex: 1, 
        justifyContent: 'center', 
        paddingLeft: 10
    },
    nameLabelText: {
        fontSize: 20
    },
    nameTextInputContainer: {
        flex: 2, 
        padding: 10, 
        backgroundColor: '#dddddd', 
        borderRadius: 10
    },
    nameTextInput: {
        paddingHorizontal: 10, 
        fontSize: 20
    },
    goalContainer: {
        flexDirection: 'column', 
        marginBottom: 10
    },
    goalLabelContainer: {
        paddingLeft: 10, 
        marginBottom: 10
    },
    goalLabelText: {
        fontSize: 20
    },
    goalTextInputContainer: {
        padding: 10, 
        backgroundColor: '#dddddd', 
        borderRadius: 10
    },
    goalTextInput: {
        paddingHorizontal: 10, 
        fontSize: 20
    },
    maxPeopleContainer: {
        flexDirection: 'row', 
        marginBottom: 10
    },
    maxPeopleLabelContainer: {
        flex: 5, 
        justifyContent: 'center', 
        paddingLeft: 10
    },
    maxPeopleLabelText: {
        fontSize: 20
    },
    maxPeopleTextInputContainer: {
        flex: 2, 
        padding: 10, 
        backgroundColor: '#dddddd', 
        borderRadius: 10
    },
    maxPeopleTextInput: {
        paddingHorizontal: 10, 
        fontSize: 20
    },
    makeButtonContainer: {
        alignItems: 'center', 
        margin: 10
    },
    makeButton: {
        backgroundColor: '#03a9f4', 
        width: 200, 
        padding: 10, 
        borderRadius: 10
    },
    makeButtonText: {
        color: "white", 
        fontSize: 20, 
        fontWeight: 'bold', 
        textAlign:'center'
    }
})
class SomoimMake extends Component {
    state = {
        address_0: '서울특별시',
        address_1: '강남구',
        category: somoimCategoryDB[0],
        name: '',
        goal: '',
        maxPeople: '20'
    }
    onChangeTextName = (name) => {
        this.setState({
            name
        })
    }
    onChangeTextGoal = (goal) => {
        this.setState({
            goal
        })
    }
    onChangeTextMaxPeople = (maxPeople) => {
        this.setState({
            maxPeople
        })
    }
    make = () => {
        const { address_0, address_1, category, name, goal, maxPeople } = this.state;
        const user = store.getState().user;
        
        if( address_0 === '' || address_1 === '' || category === '' || name === '' || goal === '' || maxPeople === ''){
            alert('빈칸 없이 입력해주세요')
        }else if(isNaN(Number(maxPeople))){
            alert('모임 정원은 숫자로 입력해주세요.')
        }else{
            db.collection('somoim').add({
                makeTime: firebase.firestore.FieldValue.serverTimestamp(),
                address_0: address_0,
                address_1: address_1,
                category: category,
                name: name,
                goal: goal,
                maxPeople: Number(maxPeople),
                photo: null,
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then((documentReference) => {
                db.collection('somoim').doc(documentReference.id).collection('members').add({
                    uid: user.uid,
                    grade: 0
                })
                .then(res => this.setState({
                    address_0: '서울특별시',
                    address_1: '강남구',
                    category: somoimCategoryDB[0],
                    name: '',
                    goal: '',
                    maxPeople: '20'
                }, () => this.props.navigation.goBack()))
            })
        }
    }
    render(){
        return(
            <View style={styles.container}>
                <ScrollView>
                    <View style={styles.addressContainer}>
                        <View style={styles.addressLabelContainer}>
                            <Text style={styles.addressLabelText}>
                                지역
                            </Text>
                        </View>
                        <View style={styles.addressPickerContainer}>
                            <Picker
                                style={styles.address_0_picker}
                                dropdownIconColor="gray"
                                selectedValue={this.state.address_0}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({address_0: itemValue, address_1: addressDB[itemValue][0]});
                                }}>
                                {Object.keys(addressDB).map((v,i) => {
                                    return <Picker.Item label={v} value={v} key={i+v}/>
                                })}
                            </Picker>
                            <Picker 
                                dropdownIconColor="gray"
                                selectedValue={this.state.address_1}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({address_1: itemValue});
                                }}>
                                {addressDB[this.state.address_0].map((v,i) => {
                                    return <Picker.Item label={v} value={v} key={i+v}/>
                                })}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.categoryContainer}>
                        <View style={styles.categoryLabelContainer}>
                            <Text style={styles.categoryLabelText}>
                                카테고리
                            </Text>
                        </View>
                        <View style={styles.categoryPickerContainer}>
                            <Picker 
                                dropdownIconColor="gray"
                                selectedValue={this.state.category}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({category: itemValue});
                                }}>
                                {somoimCategoryDB.map((v,i) => {
                                    return <Picker.Item label={v} value={v} key={i+v}/>
                                })}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.nameContainer}>
                        <View style={styles.nameLabelContainer}>
                            <Text style={styles.nameLabelText}>
                                모임 이름
                            </Text>
                        </View>
                        <View style={styles.nameTextInputContainer}>
                            <TextInput
                                style={styles.nameTextInput}
                                onChangeText={this.onChangeTextName}
                                value={this.state.name}
                                autoCompleteType="off"
                                autoCorrect={false}
                                keyboardType="default"
                            />
                        </View>
                    </View>
                    <View style={styles.goalContainer}>
                        <View style={styles.goalLabelContainer}>
                            <Text style={styles.goalLabelText}>
                                모임 목표
                            </Text>
                        </View>
                        <View style={styles.goalTextInputContainer}>
                            <TextInput
                                style={styles.goalTextInput}
                                onChangeText={this.onChangeTextGoal}
                                value={this.state.goal}
                                autoCompleteType="off"
                                autoCorrect={false}
                                keyboardType="default"
                                multiline={true}
                                textAlignVertical="top"
                                numberOfLines={2}
                            />
                        </View>
                    </View>
                    <View style={styles.maxPeopleContainer}>
                        <View style={styles.maxPeopleLabelContainer}>
                            <Text style={styles.maxPeopleLabelText}>
                                모임 정원
                            </Text>
                        </View>
                        <View style={styles.maxPeopleTextInputContainer}>
                            <TextInput
                                style={styles.maxPeopleTextInput}
                                onChangeText={this.onChangeTextMaxPeople}
                                value={this.state.maxPeople}
                                autoCompleteType="off"
                                autoCorrect={false}
                                keyboardType="number-pad"
                                textAlign="center"
                            />
                        </View>
                    </View>
                    <View style={styles.makeButtonContainer}>
                        <TouchableOpacity style={styles.makeButton} onPress={this.make}>
                            <Text style={styles.makeButtonText}>
                                모임 만들기
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default SomoimMake;