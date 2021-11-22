import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import Logo from '../assets/logo.png';
import IndicatorComponent from './IndicatorComponent';
import * as ImagePicker from 'expo-image-picker';
import store from '../store';
import fb from '../fb';
import OpenDataSetting from './OpenDataSetting';
const fbStorage = fb.storage();
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
    image: {
        width:100, 
        height:100
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
        fontSize: 20,
        fontWeight: "bold"
    },
    modalItem: {
        marginBottom: 10
    },
    modalItemText: {
        fontSize: 16, 
        fontWeight: "bold"
    },
    modalButton: {
        marginTop: 10
    },
    modalButtonText: {
        fontSize: 20, 
        fontWeight: "bold"
    }
})
class PhotoMyInfo extends Component {
    state = {
        profilePhotoChangeMethodChoice_modal: false,
        profilePhotoUrl: store.getState().user.profilePhotoUrl,
        indicatorComponent: false
    }
    profilePhotoChangeByPickImage = async (select) => {
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
                const user = await store.getState().user;
                const response = await fetch(result.uri);
                const blob = await response.blob();
                const uploadTask = await fbStorage.ref().child(`${user.uid}/profilePhoto.png`).put(blob, {
                    contentType: 'image/jpeg',
                });
                const attachmentUrl = await uploadTask.ref.getDownloadURL();
                this.setState({
                    profilePhotoUrl: attachmentUrl,
                    indicatorComponent: false,
                    profilePhotoChangeMethodChoice_modal: false
                })
                store.dispatch({ type: 'user', user: {...user, profilePhotoUrl: attachmentUrl}});
                db.doc(`users/${user.docId}`).update({profilePhotoUrl: attachmentUrl})
            }else {
                this.setState({
                    indicatorComponent: false,
                    profilePhotoChangeMethodChoice_modal: false
                })
            }
        }
    }
    profilePhotoChangeByDefault = () => {
        const user = store.getState().user;
        this.setState({
            profilePhotoUrl: null,
            indicatorComponent: false,
            profilePhotoChangeMethodChoice_modal: false
        })
        fbStorage.ref().child(`${user.uid}/profilePhoto.png`).delete();
        store.dispatch({ type: 'user', user: {...user, profilePhotoUrl: null}});
        db.doc(`users/${user.docId}`).update({profilePhotoUrl: null})
    }
    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.label}>
                    프로필사진
                </Text>
                <TouchableOpacity 
                    style={styles.content} 
                    onPress={() => this.setState({profilePhotoChangeMethodChoice_modal: true})}
                >
                    {this.state.profilePhotoUrl !== null ?
                        <Image 
                            style={styles.image}
                            source={{uri: this.state.profilePhotoUrl }}/>
                    :
                        <Image style={styles.image} source={Logo}/>
                    }
                    <OpenDataSetting keyword="profilePhotoUrl_open"/>
                </TouchableOpacity>
                <Modal 
                    visible={this.state.profilePhotoChangeMethodChoice_modal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={() => this.setState({profilePhotoChangeMethodChoice_modal: false})}
                >
                    <View style={styles.modalContainer}>
                        {this.state.indicatorComponent ? 
                            <IndicatorComponent /> 
                        :
                            <View style={styles.modalInnerWindow}>
                                <View style={styles.modalTitleContainer}>
                                    <Text style={styles.modalTitleText}>프로필 사진 변경</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.modalItem}
                                    onPress={() => this.setState({
                                        indicatorComponent: true
                                    }, () => this.profilePhotoChangeByPickImage("album"))}
                                >
                                    <Text style={styles.modalItemText}>앨범에서 사진 선택</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.modalItem}
                                    onPress={() => this.setState({
                                        indicatorComponent: true
                                    }, () => this.profilePhotoChangeByPickImage("camera"))}
                                >
                                    <Text style={styles.modalItemText}>카메라로 사진 찍기</Text>
                                </TouchableOpacity>
                                {this.state.profilePhotoUrl !== null ?
                                    <TouchableOpacity 
                                        style={styles.modalItem}
                                        onPress={() => this.setState({
                                            indicatorComponent: true
                                        }, () => this.profilePhotoChangeByDefault())}
                                    >
                                        <Text style={styles.modalItemText}>기본 이미지로 변경</Text>
                                    </TouchableOpacity>
                                :
                                    null
                                }
                                <TouchableOpacity 
                                    style={styles.modalButton}
                                    onPress={() => this.setState({
                                        profilePhotoChangeMethodChoice_modal: false
                                    })}
                                >
                                    <Text style={styles.modalButtonText}>취소</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </Modal>
            </View>
        )
    }
}

export default PhotoMyInfo;