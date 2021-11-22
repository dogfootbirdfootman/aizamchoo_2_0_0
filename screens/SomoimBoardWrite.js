import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Modal, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { somoimBoardCategory } from '../dbs';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import fb from '../fb';
import firebase from 'firebase/app';
import store from '../store';

const db = fb.firestore();
const fbStorage = fb.storage();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
})
class SomoimBoardWrite extends Component {
    state = {
        somoimBoardCategory: somoimBoardCategory[0],
        title: '',
        content: '',
        modal: false,
        imageUris: [null, null, null],
        clickIndex: 0,
        indicator: false
    }
    componentDidMount(){
        this.props.navigation.setOptions({
            headerRight: () => <TouchableOpacity onPress={this.onComplete}><Text style={{fontSize: 18}}>완료</Text></TouchableOpacity>
        })
    }
    onComplete = () => {
        const { title, content } = this.state;
        if(title === '' || content === ''){
            alert("제목 혹은 본문을 작성해주세요.")
        }else {
            this.setState({indicator: true}, () => {
                const user = store.getState().user;
                db.collection(`somoim/${this.props.route.params.somoim.somoimDocId}/board`).add({
                    category: this.state.somoimBoardCategory,
                    title,
                    content,
                    time: firebase.firestore.FieldValue.serverTimestamp(),
                    updateTime: firebase.firestore.FieldValue.serverTimestamp(),
                    replyUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
                    writerUid: user.uid
                })
                .then(async (docRef) => {
                    const photoUris = [null, null, null];
                    const promises = this.state.imageUris.map(async(imageUri, index) => {
                        if(imageUri !== null){
                            const response = await fetch(imageUri);
                            const blob = await response.blob();
                            const uploadTask = await fbStorage.ref().child(`somoim/${this.props.route.params.somoim.somoimDocId}/board/${docRef.id}/${index}.png`).put(blob, {
                                contentType: 'image/jpeg',
                            });
                            const attachmentUrl = await uploadTask.ref.getDownloadURL();
                            photoUris[index] = attachmentUrl;
                        }
                    })
                    await Promise.all(promises);
                    await db.doc(`somoim/${this.props.route.params.somoim.somoimDocId}/board/${docRef.id}`).update({
                        photoUris: photoUris
                    })
                    this.setState({indicator: false}, () => this.props.navigation.goBack())
                })
            })
        }
    }
    onChangeTextTitle = (title) => {
        this.setState({
            title
        })
    }
    onChangeTextContent = (content) => {
        this.setState({
            content
        })
    }
    selectImage = async (where) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('카메라 접근 권한이 없으면 작업을 실행할수 없습니다.');
        }else{
            let result;
            if(where === 'album'){
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1,1],
                    quality: 0.5,
                });
            }else if(where === "camera") {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1,1],
                    quality: 0.5,
                });
            }
            if(!result.cancelled){
                const newImageUris = [...this.state.imageUris];
                newImageUris[this.state.clickIndex] = result.uri;
                this.setState({
                    imageUris: newImageUris
                })
            }
        }
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TextInput
                        onChangeText={this.onChangeTextTitle}
                        value={this.state.title}
                        autoCompleteType="off"
                        autoCorrect={false}
                        keyboardType="default"
                        placeholder="제목(40자)"
                        style={{fontSize: 18, paddingVertical: 10, paddingLeft: 20, minWidth: 100, maxWidth: 200}}
                        maxLength={40}
                    />
                    <Picker 
                        style={{width: 150, color: '#42a5f5'}}
                        dropdownIconColor="#42a5f5"
                        selectedValue={this.state.somoimBoardCategory}
                        onValueChange={(itemValue, itemIndex) => {
                            this.setState({somoimBoardCategory: itemValue});
                        }}>
                        {somoimBoardCategory.map((v,i) => {
                            return <Picker.Item label={v} value={v} key={i+v}/>
                        })}
                    </Picker>
                </View>
                <View>
                    <TextInput
                        style={{fontSize: 18, paddingVertical: 10, paddingHorizontal: 20}}
                        onChangeText={this.onChangeTextContent}
                        value={this.state.content}
                        autoCompleteType="off"
                        autoCorrect={false}
                        keyboardType="default"
                        multiline={true}
                        textAlignVertical="top"
                        numberOfLines={5}
                        placeholder="본문"
                        maxLength={30000}
                    />
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20}}>
                    <View style={{flexDirection: 'row'}}>
                        {this.state.imageUris.map((item, index) => {
                            if(item === null){
                                return(
                                        <TouchableOpacity style={{backgroundColor: '#dddddd', padding: 20, marginRight: 20, borderRadius: 10, width: 70, alignItems:'center'}} onPress={() => this.setState({modal: true, clickIndex: index})} key={index}>
                                            <MaterialIcons name="photo-camera" size={30} color="white" />
                                        </TouchableOpacity>
                                )
                            }else {
                                return(
                                    <TouchableOpacity onPress={() => this.setState({modal: true, clickIndex: index})} key={item + index}>
                                        <Image source={{uri: item}} style={{marginRight: 20, borderRadius: 10, width: 70, height: 70}} onPress={() => this.setState({modal: true, clickIndex: index})}/>
                                    </TouchableOpacity>
                                )
                            }
                        })}
                    </View>
                    <View style={{justifyContent: 'flex-end'}}>
                        <Text>
                            {this.state.content.length} / 30000 자
                        </Text>
                    </View>
                </View>
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
                                }}>본문 첨부 사진</Text>
                            </View>
                            <TouchableOpacity 
                                style={{
                                    marginBottom: 10
                                }}
                                onPress={() => this.setState({modal: false}, () => this.selectImage("album"))}
                            >
                                <Text style={{
                                    fontSize: 16, 
                                    fontWeight: "bold"
                                }}>사진첩</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{
                                    marginBottom: 10
                                }}
                                onPress={() => this.setState({modal: false}, () => this.selectImage("camera"))}
                            >
                                <Text style={{
                                    fontSize: 16, 
                                    fontWeight: "bold"
                                }}>카메라</Text>
                            </TouchableOpacity>
                            {this.state.imageUris[this.state.clickIndex] !== null ?
                                <TouchableOpacity 
                                    style={{
                                        marginBottom: 10
                                    }}
                                    onPress={() => {
                                        const newImageUris = [...this.state.imageUris];
                                        newImageUris[this.state.clickIndex] = null;
                                        this.setState({
                                            modal: false,
                                            imageUris: newImageUris
                                        })
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 16, 
                                        fontWeight: "bold"
                                    }}>삭제</Text>
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
                        
                    </View>
                </Modal>
                <Modal 
                    visible={this.state.indicator}
                    animationType={'fade'} 
                    transparent={true} 
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: "#ffffff00",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <ActivityIndicator size="large" color="#0000ff"/>
                    </View>
                </Modal>
            </View>
        )
    }
}

export default SomoimBoardWrite;