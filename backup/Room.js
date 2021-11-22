import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import Logo from '../assets/logo.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import fb from '../fb';
import firebase from 'firebase/app';
import { minimalizeAddressDB } from '../dbs';
import store from '../store';
const db = fb.firestore();
class Room extends Component {
    constructor(props){
        super(props);
        this.state = {
            myMemberData: this.props.route.params.memberData,
            room: this.props.route.params.roomData,
            memberId: this.props.route.params.memberId,
            roomId: this.props.route.params.roomId,
            message: [],
            textInput: '',
        }
        this.scrollRef = React.createRef()
    }
    componentDidMount(){
        const { roomId, memberId } = this.state;
        // myMemberData 구독
        this.unsubscribeMyMemberDataUpdate = db.doc(`rooms/${roomId}/member/${memberId}`).onSnapshot((documentSnapshot) => {
            if(documentSnapshot.exists){
                this.setState({myMemberData: documentSnapshot.data()})
            }
        })
        // room ( 이 방 ) 구독 
        this.unsubscribeRoomDataUpdate = db.doc(`rooms/${roomId}`).onSnapshot((documentSnapshot) => {
            const room = documentSnapshot.data();
            this.setState({room});
        })
        // 이 방의 message 구독
        this.unsubscribeMessageUpdate = db.doc(`rooms/${roomId}`).collection("message").orderBy("time").onSnapshot((querySnapshot) => {
            const message = querySnapshot.docs.map((doc, index) => {
                return doc.data()
            })
            this.setState({message})
        })
        // 뒤로 가기 누르는 이벤트 등록
        this.unsubscribeNavigation = this.props.navigation.addListener("beforeRemove", () => {
            this.roomOut()
        })
        // 키보드 생성시 이벤트 등록
        Keyboard.addListener("keyboardDidShow", () => {
            setTimeout(this.toBottom, 100)
        })
    }
    componentWillUnmount(){
        this.unsubscribeMyMemberDataUpdate();
        this.unsubscribeRoomDataUpdate();
        this.unsubscribeMessageUpdate();
        this.unsubscribeNavigation();
        Keyboard.removeAllListeners("keyboardDidShow");
    }
    toBottom = () => {
        this.scrollRef.current?.scrollToEnd({animated: true, duration: 10})
    }
    onChangeTextInput = (text) => {
        this.setState({
            textInput: text
        })
    }
    sendMessage = () => {
        const { roomId, myMemberData, textInput } = this.state;
        this.setState({
            textInput: ''
        })
        db.doc(`rooms/${roomId}`).collection("message").add({
            who: myMemberData.uid,
            content: textInput,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            type: "chat",
            profilePhotoUrl: myMemberData.profilePhotoUrl_open === 0 ? myMemberData.profilePhotoUrl : null,
            nick: myMemberData.nick_open === 0 ? myMemberData.nick: "?",
            job: myMemberData.job_open === 0 ? myMemberData.job : "?",
            address_0: myMemberData.address_open === 0 ? myMemberData.address_0 : "?",
            sex: myMemberData.sex
        })
    }
    roomOut = async () => {
        const { roomId, memberId, room, myMemberData } = this.state;
        await db.doc(`rooms/${roomId}/member/${memberId}`).delete();
        const sexCount = myMemberData.sex === "남성" ? { man: room.man - 1 } : { woman: room.woman - 1 };

        if(room.man + room.woman === 1){
            const querySnapshot = await db.doc(`rooms/${roomId}`).collection("message").get();
            querySnapshot.forEach((queryDocumentSnapshot) => {
                queryDocumentSnapshot.ref.delete();
            })
            await db.doc(`rooms/${roomId}`).delete()
        }else {
            if(room.master.uid === myMemberData.uid){
                await db.doc(`rooms/${roomId}`).update({ status: 3, ...sexCount });
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                    time:  firebase.firestore.FieldValue.serverTimestamp()
                });
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `방장 ${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하여 방이 종료됩니다.`,
                    time:  firebase.firestore.FieldValue.serverTimestamp()
                })
            }else{
                await db.doc(`rooms/${roomId}`).update({ status: 0, ...sexCount });
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                    time:  firebase.firestore.FieldValue.serverTimestamp()
                })
            }
        }
        // 비정상 접속 종료시 처리를 위한 유저 위치 정보 업데이트
        await db.doc(`users/${myMemberData.docId}`).update({roomId: null, memberId: null})

        const storeUser = store.getState().user;
        store.dispatch({ type: 'user', user: {...storeUser, roomId: null, memberId: null}});
    }
    render(){
        return(
            <View style={styles.container}>
                <ScrollView 
                    ref={this.scrollRef} 
                    onContentSizeChange={this.toBottom} 
                >
                    {
                        this.state.message.length !== 0 ?
                            this.state.message.map((msg, index) => {
                                if(msg.time >= this.state.myMemberData.time){
                                    return(
                                        <View 
                                            key={index + msg.content + msg.who}
                                            style={{
                                                alignItems: 
                                                    msg.who === 'system' ? 
                                                        'center' 
                                                    : 
                                                        this.state.myMemberData.uid === msg.who ? 
                                                        'flex-end' : 'flex-start',
                                                marginVertical: 5,
                                                marginHorizontal: 10
                                            }}
                                        >
                                            <View style={{flexDirection: 'row'}}>
                                                {
                                                    msg.type === 'chat' ?
                                                        msg.who !== this.state.myMemberData.uid ?
                                                            this.state.message[index].who !== this.state.message[index - 1].who ?
                                                                <Image 
                                                                    style={{width:50, height:50, borderRadius: 10, marginRight: 10}}
                                                                    source={msg.profilePhotoUrl ? {uri: msg.profilePhotoUrl} : Logo}
                                                                />
                                                            :
                                                                null
                                                        :
                                                            null
                                                    :
                                                        null
                                                }
                                                <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                                                    {
                                                        msg.type === 'chat' ?
                                                            msg.who !== this.state.myMemberData.uid ?
                                                                this.state.message[index].who !== this.state.message[index - 1].who ? 
                                                                    <Text style={{fontSize: 16}}>
                                                                        {msg.nick}/{msg.job}/{msg.sex[0]}/{minimalizeAddressDB[msg.address_0]}
                                                                    </Text>
                                                                :
                                                                    null
                                                            :
                                                                null
                                                        :
                                                            null
                                                    }
                                                    <Text style={
                                                        msg.who === 'system' ? {
                                                            color: 'white',
                                                            backgroundColor: '#7a97bb',
                                                            paddingHorizontal: 10,
                                                            paddingVertical: 5,
                                                            borderRadius: 10,
                                                            textAlignVertical: 'center'
                                                        } : 
                                                            this.state.myMemberData.uid === msg.who ? {
                                                                color: 'black',
                                                                backgroundColor: 'yellow',
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 5,
                                                                borderRadius: 10,
                                                                textAlignVertical: 'center',
                                                                flexWrap: 'wrap',
                                                                maxWidth: Dimensions.get('window').width * 7 / 10,
                                                                fontSize: 16
                                                            } : {
                                                                color: 'black',
                                                                backgroundColor: 'white',
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 5,
                                                                borderRadius: 10,
                                                                textAlignVertical: 'center',
                                                                flexWrap: 'wrap',
                                                                maxWidth: Dimensions.get('window').width * 7 / 10,
                                                                marginLeft: this.state.message[index].who !== this.state.message[index - 1].who ? 0 : 60,
                                                                fontSize: 16
                                                            }
                                                    }>
                                                        {msg.content}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                }
                            })
                        : 
                        null
                    }
                </ScrollView>
                <View style={styles.textInputContainer}>
                    <TextInput 
                        style={styles.textInput}
                        onChangeText={text => this.onChangeTextInput(text)}
                        value={this.state.textInput}
                        autoCompleteType="off"
                        autoCorrect={false}
                    />
                    {
                        this.state.textInput.length !== 0 &&
                        <TouchableOpacity style={styles.buttonContainer} onPress={this.sendMessage}>
                            <MaterialCommunityIcons name="comment-arrow-right" size={30} color="black" />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#67abff',
        paddingTop: 5
    },
    textInputContainer: {
        backgroundColor: 'white',
        height: 50,
        flexDirection: 'row'
    },
    textInput: {
        flex: 9,
        fontSize: 20,
        paddingHorizontal: 10
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'yellow',
        paddingHorizontal: 10
    },
})
export default Room;