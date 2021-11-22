import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import Logo from '../assets/logo.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import fb from '../fb';
import firebase from 'firebase/app';
import { minimalizeAddressDB, plazaQuestionDB, plazaNoticeDB } from '../dbs';
import store from '../store';
const db = fb.firestore();
const realdb = fb.database();
class PlazaRoom extends Component {
    constructor(props){
        super(props);
        this.state = {
            myMemberData: this.props.route.params.memberData,
            room: this.props.route.params.roomData,
            memberId: this.props.route.params.memberId,
            roomId: this.props.route.params.roomId,
            message: [],
            textInput: '',
            isAnswered: false,
            selectedNumber: -1
        }
        this.scrollRef = React.createRef()
    }
    componentDidMount(){
        const { roomId, memberId } = this.state;
        // myMemberData 구독
        this.unsubscribeMyMemberDataUpdate = db.doc(`rooms/${roomId}/member/${memberId}`).onSnapshot((documentSnapshot) => {
            if(documentSnapshot.exists){
                this.setState({myMemberData: documentSnapshot.data()}, () => {
                    this.isAnsweredCheck();
                })
            }
        })
        // room ( 이 방 ) 구독 
        this.unsubscribeRoomDataUpdate = db.doc(`rooms/${roomId}`).onSnapshot((documentSnapshot) => {
            const room = documentSnapshot.data();
            this.setState({room}, () => {
                this.isAnsweredCheck();
                this.friendRegister();
            });
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
            clearInterval(this.inter)
        })
        // 키보드 생성시 이벤트 등록
        Keyboard.addListener("keyboardDidShow", () => {
            setTimeout(this.toBottom, 100)
        })
        this.inter = setInterval(this.autoQuestionLoop, 15000);
    }
    componentWillUnmount(){
        this.unsubscribeMyMemberDataUpdate();
        this.unsubscribeRoomDataUpdate();
        this.unsubscribeMessageUpdate();
        this.unsubscribeNavigation();
        Keyboard.removeAllListeners("keyboardDidShow");
        clearInterval(this.inter)
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
                const leftMemberSnapshot = await db.collection("rooms").doc(roomId).collection("member").orderBy("time").get()
                const newMaster = leftMemberSnapshot.docs[0].data();
                await db.doc(`rooms/${roomId}`).update({ master: newMaster, status: 0, ...sexCount });
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                    time:  firebase.firestore.FieldValue.serverTimestamp()
                })
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `${newMaster.nick_open === 0 ? newMaster.nick : "?"} 님이 방장이 되셨습니다.`,
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
        const storeUser = store.getState().user;
        const userStatusDatabaseRef = realdb.ref('/status/' + storeUser.uid);
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            roomId: "",
            memberId: "",
            docId: storeUser.docId,
            sex: storeUser.sex,
            job: storeUser.job,
            heightCentimeter: Number(storeUser.heightCentimeter.slice(0,3)),
            age: Number(new Date(Date.now()).getFullYear() - storeUser.age.toDate().getFullYear() + 1),
            religion: storeUser.religion,
            earnPerYear: storeUser.earnPerYear,
            family: storeUser.family,
            hobby: storeUser.hobby,
            drink: storeUser.drink,
            smoke: storeUser.smoke,
            character: storeUser.character,
            bodyForm: storeUser.bodyForm,
            style: storeUser.style
        };
        await userStatusDatabaseRef.set(isOnlineForDatabase);
        await db.doc(`users/${myMemberData.docId}`).update({roomId: "", memberId: ""})
        store.dispatch({ type: 'user', user: {...storeUser, roomId: "", memberId: ""}});
    }
    autoQuestionLoop = () => {
        const { roomId, room, myMemberData } = this.state;
        // console.log("//닉네임 =>", this.state.myMemberData.nick, "//방 상태 =>", this.state.room.status, "//질문 상태 =>", this.state.room.questionStatus, "//시간 =>", Date.now())
        const list =  plazaQuestionDB;
        if(room.questionStatus === 2){
            clearInterval(this.inter)
        }else if(room.master.uid === myMemberData.uid){
            if(room.man + room.woman > 1){
                if(room.questionList.length === 0 || room.questionStatus === 0){
                    const idx = Math.floor(Math.random() * list.length);
                    db.doc(`rooms/${roomId}`).update({
                        questionList: [idx],
                        questionStatus: 99
                    })
                }else {
                    if(room.questionList.length < list.length){
                        const idxs = room.questionList;
                        let flag = true;
                        while(flag){
                            const idx = Math.floor(Math.random() * list.length);
                            if(idxs.indexOf(idx) === -1){
                                db.doc(`rooms/${roomId}`).update({
                                    questionList: [idx,...room.questionList],
                                    questionStatus: 99
                                })
                                flag = false;
                            }
                        }
                    }else {
                        db.doc(`rooms/${roomId}`).update({
                            questionStatus: 2
                        })
                    }
                }
            }else{
                if(room.questionStatus === 99){
                    db.doc(`rooms/${roomId}`).update({
                        questionStatus: 1
                    })
                }
            }
        }
    }
    answer = ( index1, index2 ) => {
        const { roomId, memberId, myMemberData } = this.state;
        const answerList = [...myMemberData.answer, `${index1}${index2}`]
        db.doc(`rooms/${roomId}/member/${memberId}`).update({
            answer: answerList
        })
    }
    isAnsweredCheck = () => {
        let isAnswered = false;
        let selectedNumber = -1
        this.state.myMemberData.answer.map((ans, index) => {
            const idx = Number(ans.slice(0, -1));
            if(idx === this.state.room.questionList[0]){
                isAnswered = true;
                selectedNumber = Number(ans.slice(-1))
            }
        })
        this.setState({
            isAnswered,
            selectedNumber
        })
    }
    friendRegister = async () => {
        const { roomId, memberId, myMemberData } = this.state;
        const myAnswers = myMemberData.answer
        const allMemberRef = await db.collection(`rooms/${roomId}/member`).get();
        const myRef = await db.doc(`users/${myMemberData.docId}`).get();
        const myFriendList = myRef.data().friends;
        allMemberRef.docs.map(async (doc, index) => {
            const indexOfNum = myFriendList.indexOf(doc.data().uid);
            if(doc.id !== memberId && doc.data().sex !== myMemberData.sex && indexOfNum === -1){
                let same = [];
                const yourAnswers = doc.data().answer;
                for(let i=0; i<myAnswers.length;i++){
                    for(let j=0; j<yourAnswers.length;j++){
                        if(myAnswers[i] === yourAnswers[j]){
                            same.push(myAnswers[i])
                        }
                    }
                }
                if(same.length > 2){
                    // newFriendList.push(doc.data().uid) 
                    await db.doc(`users/${myMemberData.docId}`).update({friends: [...myFriendList, doc.data().uid]});
                    const storeUser = store.getState().user;
                    store.dispatch({ type: 'user', user: {...storeUser, friends: [...myFriendList, doc.data().uid]}})
                    if(myMemberData.sex === '남성'){
                        await this.robotChat(`${myMemberData.nick} 님과 ${doc.data().nick} 님이 친구가 되셨습니다.`);
                        await this.sameListChat(same);
                    }
                }
            }
        })
    }
    sameListChat = async (list) => {
        await db.doc(`rooms/${this.state.roomId}`).collection("message").add({
            who: 'n5dCczQosxbCYpnmpZvZCzdy4Xx2',
            content: list,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            type: "sameList",
            profilePhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/naturalmeeting-2e64a.appspot.com/o/n5dCczQosxbCYpnmpZvZCzdy4Xx2%2FprofilePhoto.png?alt=media&token=76868e33-c956-460c-8d58-999333b35b05',
            nick: `Ai 쟈만츄`
        })
    }
    robotChat = async (msg) => {
        await db.doc(`rooms/${this.state.roomId}`).collection("message").add({
            who: '9OhGMvE914g3iXSzPj0FT7U0U8H2',
            content: msg,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            type: "bot",
            profilePhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/naturalmeeting-2e64a.appspot.com/o/n5dCczQosxbCYpnmpZvZCzdy4Xx2%2FprofilePhoto.png?alt=media&token=76868e33-c956-460c-8d58-999333b35b05',
            nick: `Ai 쟈만츄`
        })
    }
    render(){
        return(
            <View style={styles.container}>
                <ScrollView 
                    ref={this.scrollRef} 
                    onContentSizeChange={this.toBottom}
                    stickyHeaderIndices={[0]} 
                >
                    {this.state.room.questionStatus === 99 ? 
                        this.state.isAnswered ? 
                            <View style={styles.questionContainer}>
                                <Text style={styles.questionTitleText}>
                                    {this.state.room.questionList.length}. {plazaQuestionDB[this.state.room.questionList[0]].title}
                                </Text>
                                {plazaQuestionDB[this.state.room.questionList[0]].selection.map((item, index) => {
                                    return(
                                        <View 
                                            key={item+index} 
                                        >
                                            <Text 
                                                style={this.state.selectedNumber === index ? 
                                                    styles.choiced 
                                                : 
                                                styles.unChoiced}
                                            >
                                                {index + 1}. {item}
                                            </Text>
                                        </View>
                                    )
                                })}
                            </View>
                        :
                            <View style={styles.questionContainer}>
                                <Text style={styles.questionTitleText}>
                                    {this.state.room.questionList.length}. {plazaQuestionDB[this.state.room.questionList[0]].title}
                                </Text>
                                    {plazaQuestionDB[this.state.room.questionList[0]].selection.map((item, index) => {
                                    return(
                                        <TouchableOpacity 
                                            key={item+index} 
                                            onPress={() => this.answer(this.state.room.questionList[0], index)}>
                                            <Text style={styles.questionSelectionText}>
                                                {index + 1}. {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                    :
                        <View style={styles.questionContainer}>
                            <Text style={styles.questionTitleText}>
                                {plazaNoticeDB[this.state.room.questionStatus].title}
                            </Text>
                            {plazaNoticeDB[this.state.room.questionStatus].selection.map((item, index) => {
                                return(
                                    <View key={item+index}>
                                        <Text style={styles.questionSelectionText}>
                                            {index + 1}. {item}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    }
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
                                                    msg.type === 'chat' || msg.type === 'sameList' || msg.type === 'bot' ?
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
                                                    {
                                                        msg.type === 'sameList' || msg.type === 'bot' ?
                                                            this.state.message[index].who !== this.state.message[index - 1].who ? 
                                                                <Text style={{fontSize: 16}}>
                                                                    {msg.nick}
                                                                </Text>
                                                            :
                                                                null
                                                        :
                                                            null
                                                    }
                                                    {
                                                        msg.type === 'sameList' ? 
                                                            <View style={{
                                                                backgroundColor: 'white',
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 5,
                                                                borderRadius: 10,
                                                                maxWidth: Dimensions.get('window').width * 7 / 10,
                                                                marginLeft: this.state.message[index].who !== this.state.message[index - 1].who ? 0 : 60,
                                                            }}>
                                                                <Text style={{fontSize: 20, color: 'red', marginBottom: 20}}>
                                                                    ** 케미가 맞은 목록 **
                                                                </Text>
                                                                {msg.content.map((item, index) => {
                                                                    return(
                                                                        <View key={index+item}>
                                                                            <Text style={{
                                                                                fontSize: 20, fontWeight: 'bold',
                                                                                marginBottom: 10
                                                                            }}>
                                                                                {index + 1}. {plazaQuestionDB[Number(item.slice(0, -1))].title}
                                                                            </Text>
                                                                            <Text style={{
                                                                                fontSize: 16,
                                                                                marginBottom: 10,
                                                                                marginLeft: 20
                                                                            }}>
                                                                                {plazaQuestionDB[Number(item.slice(0, -1))].selection[Number(item.slice(-1))]}
                                                                            </Text>
                                                                        </View>    
                                                                    )
                                                                })}
                                                            </View>
                                                        :

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
                                                    }
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
    questionContainer: {
        backgroundColor:'white',
        padding: 10
    },
    questionTitleText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5
    },
    questionSelectionText: {
        fontSize: 16,
        marginBottom: 5,
        marginLeft: 5
    },
    choiced: {
        fontSize: 16,
        marginBottom: 5,
        marginLeft: 5,
        color: 'red',
        fontWeight: 'bold',
    },
    unChoiced: {
        fontSize: 16,
        marginBottom: 5,
        marginLeft: 5,
        color: '#cccccc',
    },
})
export default PlazaRoom;