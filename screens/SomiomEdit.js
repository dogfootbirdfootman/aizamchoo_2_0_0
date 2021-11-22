import React, { Component } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Image, Dimensions, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addressDB, somoimCategoryDB } from '../dbs';
import fb from '../fb';
import firebase from 'firebase/app';
import somoimPhoto from '../assets/somoimPhoto.png';
import IndicatorComponent from '../components/IndicatorComponent';
import * as ImagePicker from 'expo-image-picker';

const db = fb.firestore();
const fbStorage = fb.storage();

const styles = StyleSheet.create({
    container: {
        padding: 10
    },
    addressContainer: {
        flexDirection: 'row', 
        marginBottom: 10
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
class SomoimEdit extends Component {
    state = {
        address_0: this.props.route.params.somoim.address_0,
        address_1: this.props.route.params.somoim.address_1,
        category: this.props.route.params.somoim.category,
        name: this.props.route.params.somoim.name,
        goal: this.props.route.params.somoim.goal,
        photo: this.props.route.params.somoim.photo,
        maxPeople: '20',
        modal: this.props.route.params.modal,
        indicatorComponent: false
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
    update = () => {
        const { address_0, address_1, category, name, goal, maxPeople} = this.state;
        db.collection('somoim').doc(`${this.props.route.params.somoim.somoimDocId}`).update({
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
            address_0, address_1, category, name, goal, maxPeople
        })
        .then(res => this.props.navigation.goBack())

    }
    photoChangeByPickImage = async (select) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('카메라 접근 권한이 없으면 작업을 실행할수 없습니다.');
        }else{
            let result;
            if(select === "album"){
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1,1],
                    quality: 0.5,
                });
            }else if(select === "camera") {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1,1],
                    quality: 0.5,
                });
            }
            if(!result.cancelled){
                const response = await fetch(result.uri);
                const blob = await response.blob();
                const uploadTask = await fbStorage.ref().child(`somoim/${this.props.route.params.somoim.somoimDocId}/mainDoor/photo.png`).put(blob, {
                    contentType: 'image/jpeg',
                });
                const attachmentUrl = await uploadTask.ref.getDownloadURL();
                this.setState({
                    photo: attachmentUrl,
                    indicatorComponent: false,
                    modal: false
                })
                db.doc(`somoim/${this.props.route.params.somoim.somoimDocId}`).update({photo: attachmentUrl})
            }else {
                this.setState({
                    indicatorComponent: false,
                    modal: false
                })
            }
        }
    }
    photoChangeByDefault = () => {
        this.setState({
            photo: null,
            indicatorComponent: false,
            modal: false
        })
        fbStorage.ref().child(`somoim/${this.props.route.params.somoim.somoimDocId}/mainDoor/photo.png`).delete();
        db.doc(`somoim/${this.props.route.params.somoim.somoimDocId}`).update({photo: null})
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
                    <View style={{marginBottom: 10}}>
                        <TouchableWithoutFeedback onPress={() => this.setState({modal:true})}>
                            <Image 
                                source={this.state.photo ? {uri: this.state.photo} : somoimPhoto}
                                style={{
                                    width: Dimensions.get('window').width - 20, 
                                    height: Dimensions.get('window').width / 3,
                                    resizeMode: "stretch"
                                }}
                            />
                        </TouchableWithoutFeedback>
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
                        <TouchableOpacity style={styles.makeButton} onPress={this.update}>
                            <Text style={styles.makeButtonText}>
                                수정하기
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Modal 
                    visible={this.state.modal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={() => this.setState({modal: false})}
                >
                    <View style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#90909082"
                    }}>
                        {this.state.indicatorComponent ? 
                            <IndicatorComponent /> 
                        :
                            <View style={{
                                backgroundColor: "#ffffff",
                                borderRadius: 10,
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 30
                            }}>
                                <View style={{
                                    marginBottom: 10
                                }}>
                                    <Text style={{
                                        fontSize: 20,
                                        fontWeight: "bold"
                                    }}>소모임 사진 변경</Text>
                                </View>
                                <TouchableOpacity 
                                    style={{
                                        marginBottom: 10
                                    }}
                                    onPress={() => this.setState({
                                        indicatorComponent: true
                                    }, () => this.photoChangeByPickImage("album"))}
                                >
                                    <Text style={{
                                        fontSize: 16, 
                                        fontWeight: "bold"
                                    }}>앨범에서 사진 선택</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={{
                                        marginBottom: 10
                                    }}
                                    onPress={() => this.setState({
                                        indicatorComponent: true
                                    }, () => this.photoChangeByPickImage("camera"))}
                                >
                                    <Text style={{
                                        fontSize: 16, 
                                        fontWeight: "bold"
                                    }}>카메라로 사진 찍기</Text>
                                </TouchableOpacity>
                                {this.state.photo !== null ?
                                    <TouchableOpacity 
                                        style={{
                                            marginBottom: 10
                                        }}
                                        onPress={() => this.setState({
                                            indicatorComponent: true
                                        }, () => this.photoChangeByDefault())}
                                    >
                                        <Text style={{
                                            fontSize: 16, 
                                            fontWeight: "bold"
                                        }}>기본 이미지로 변경</Text>
                                    </TouchableOpacity>
                                :
                                    null
                                }
                                <TouchableOpacity 
                                    style={{
                                        marginTop: 10
                                    }}
                                    onPress={() => this.setState({
                                        modal: false
                                    })}
                                >
                                    <Text style={{
                                        fontSize: 20, 
                                        fontWeight: "bold"
                                    }}>취소</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </Modal>
            </View>
        )
    }
}

export default SomoimEdit;