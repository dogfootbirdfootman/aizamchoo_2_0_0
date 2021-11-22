import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import fb from '../fb';
import firebase from 'firebase/app';
import Logo from '../assets/logo.png';
import store from '../store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { minimalizeAddressDB, meetingQuestionDB, meetingNoticeDB } from '../dbs';

function messageDraw(message, index, uid, allMessage){
    const styles = StyleSheet.create({
        systemContainer: {
            alignItems:'center',
            marginVertical: 5,
            marginHorizontal: 10
        },
        yellowContainer: {
            alignItems:'flex-end',
            marginVertical: 5,
            marginHorizontal: 10
        },
        whiteContainer: {
            alignItems:'flex-start',
            marginVertical: 5,
            marginHorizontal: 10
        },
        rowContainer: {
            flexDirection: 'row'
        },
        profileImage: {
            width:50, 
            height:50, 
            borderRadius: 10,
            marginRight: 10
        },
        columnContainer: {
            flexDirection: 'column', 
            alignItems: 'flex-start'
        },
        profileText: {
            fontSize: 16
        },
        systemText: {
            color: 'white',
            backgroundColor: '#7a97bb',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            textAlignVertical: 'center'
        },
        yellowText: {
            color: 'black',
            backgroundColor: 'yellow',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            textAlignVertical: 'center',
            flexWrap: 'wrap',
            maxWidth: Dimensions.get('window').width * 7 / 10,
            fontSize: 16
        },
        whiteTextStart: {
            color: 'black',
            backgroundColor: 'white',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            textAlignVertical: 'center',
            flexWrap: 'wrap',
            maxWidth: Dimensions.get('window').width * 7 / 10,
            marginLeft: 0,
            fontSize: 16
        },
        whiteTextContinue: {
            color: 'black',
            backgroundColor: 'white',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            textAlignVertical: 'center',
            flexWrap: 'wrap',
            maxWidth: Dimensions.get('window').width * 7 / 10,
            marginLeft: 60,
            fontSize: 16
        }
    })
    return(
        <View 
            key={index + message.content + message.who}
            style={
                message.who === 'system' ? 
                    styles.systemContainer 
                : 
                    uid === message.who ? 
                        styles.yellowContainer
                    : 
                        styles.whiteContainer
                }
        >
            <View style={styles.rowContainer}>
                {
                    ( message.type === 'chat' || message.type === 'bot' ) &&
                    message.who !== uid &&
                    allMessage[index].who !== allMessage[index - 1].who &&
                    <Image 
                        style={styles.profileImage}
                        source={message.profilePhotoUrl ? {uri: message.profilePhotoUrl} : Logo}
                    />
                }
                <View style={styles.columnContainer}>
                    {
                        message.type === 'chat' &&
                        message.who !== uid &&
                        allMessage[index].who !== allMessage[index - 1].who && 
                        <Text style={styles.profileText}>
                            {message.nick}/{message.job}/{message.sex[0]}/{minimalizeAddressDB[message.address_0]}
                        </Text>
                    }
                    {
                        message.type === 'bot' &&
                        message.who !== uid &&
                        allMessage[index].who !== allMessage[index - 1].who && 
                        <Text style={styles.profileText}>
                            {message.nick}
                        </Text>
                    }
                    <Text style={
                        message.who === 'system' ? 
                            styles.systemText 
                        : 
                            uid === message.who ? 
                                styles.yellowText 
                            : 
                                allMessage[index].who !== allMessage[index - 1].who ?
                                    styles.whiteTextStart
                                :
                                    styles.whiteTextContinue
                    }>
                        {message.content}
                    </Text>
                </View>
            </View>
        </View>
    )
}
function textInputDraw(value, onChangeTextInput, sendMessage){
    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            height: 50,
            flexDirection: 'row'
        },
        textInput: {
            flex: 9,
            fontSize: 20,
            paddingHorizontal: 10
        },
        sendMessagebuttonContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'yellow',
            paddingHorizontal: 10
        }
    })
    return(
        <View style={styles.container}>
            <TextInput 
                style={styles.textInput}
                onChangeText={onChangeTextInput}
                value={value}
                autoCompleteType="off"
                autoCorrect={false}
            />
            {
                value.length !== 0 &&
                <TouchableOpacity style={styles.sendMessagebuttonContainer} onPress={sendMessage}>
                    <MaterialCommunityIcons name="comment-arrow-right" size={30} color="black" />
                </TouchableOpacity>
            }
        </View>
    )
}
function stickyDraw(db, idx, array = null){
    const styles = StyleSheet.create({
        container: {
            backgroundColor:'white',
            padding: 10
        },
        titleText: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 5
        },
        selectionText: {
            fontSize: 16,
            marginBottom: 5,
            marginLeft: 5
        }
    })
    return(
        <View style={styles.container}>
            <Text style={styles.titleText}>
                {array ? array.length + ". " + db[idx].title : db[idx].title}
            </Text>
            {db[idx].selection.map((item, index) => {
                if(array){
                    return(
                        <TouchableOpacity key={item+index}>
                            <Text style={styles.selectionText}>
                                {index + 1}. {item}
                            </Text>
                        </TouchableOpacity>
                    )
                }else{
                    return(
                        <View key={item+index}>
                            <Text style={styles.selectionText}>
                                {index + 1}. {item}
                            </Text>
                        </View>
                    )
                }
            })}
        </View>
    )
}
function tableDraw(members, questionStatus, sex, choice, selectedNumber, isAnswered) {
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row'
        },
        manContainer: {
            flex: 1, 
            backgroundColor: 'skyblue'
        },
        manTitleText: {
            fontSize: 20, 
            textAlign: 'center', 
            borderBottomWidth: 2, 
            paddingVertical: 10
        },
        manNickContainer: {
            padding: 10
        },
        manNickText: {
            fontSize: 18 
        },
        womanContainer: {
            flex: 1, 
            backgroundColor: 'pink'
        },
        womanTitleText: {
            fontSize: 20, 
            textAlign: 'center', 
            borderBottomWidth: 2, 
            paddingVertical: 10
        },
        womanNickContainer: {
            alignItems: 'flex-end',
            padding: 10
        },
        womanNickText: {
            fontSize: 18
        },
        choiced: {
            color: 'red',
            backgroundColor: 'yellow'
        },
        unchoiced: {
            color: 'black',
            backgroundColor: 'black'
        }
    })
    return(
        questionStatus === 3 ? 
            sex === '남성' ? 
                <View style={styles.container}>
                    <View style={styles.manContainer}>
                        <Text style={styles.manTitleText}>
                            남자
                        </Text>
                        {members.map((member, index) => {
                            if(member.sex === '남성'){
                                return(
                                    <View key={member.uid + index} style={styles.manNickContainer}>
                                        <Text style={styles.manNickText}>
                                            {member.nick} 님
                                        </Text>
                                    </View>
                                )
                            }
                        })}
                    </View>
                    <View style={styles.womanContainer}>
                        <Text style={styles.womanTitleText}>
                            여자
                        </Text>
                        {members.map((member, index) => {
                            if(member.sex === '여성'){
                                if(isAnswered){
                                    return(
                                        <View key={member.uid + index} style={styles.womanNickContainer}>
                                            <Text style={[styles.womanNickText, index === selectedNumber ? styles.choiced : styles.unchoiced]}>
                                                {member.nick} 님
                                            </Text>
                                        </View>
                                    )
                                }else{
                                    return(
                                        <TouchableOpacity key={member.uid + index} style={styles.womanNickContainer} onPress={() => choice(member.uid, index)}>
                                            <Text style={styles.womanNickText}>
                                                {member.nick} 님
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }
                            }
                        })}
                    </View>
                </View>
            :
                <View style={styles.container}>
                    <View style={styles.manContainer}>
                        <Text style={styles.manTitleText}>
                            남자
                        </Text>
                        {members.map((member, index) => {
                            if(member.sex === '남성'){
                                if(isAnswered){
                                    return(
                                        <View key={member.uid + index} style={styles.manNickContainer}>
                                            <Text style={[styles.womanNickText, index === selectedNumber ? styles.choiced : styles.unchoiced]}>
                                                {member.nick} 님
                                            </Text>
                                        </View>
                                    )
                                }else{
                                    return(
                                        <TouchableOpacity key={member.uid + index} style={styles.manNickContainer} onPress={() => choice(member.uid,index)}>
                                            <Text style={styles.manNickText}>
                                                {member.nick} 님
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }
                                
                            }
                        })}
                    </View>
                    <View style={styles.womanContainer}>
                        <Text style={styles.womanTitleText}>
                            여자
                        </Text>
                        {members.map((member, index) => {
                            if(member.sex === '여성'){
                                return(
                                    <View key={member.uid + index} style={styles.womanNickContainer}>
                                        <Text style={styles.womanNickText}>
                                            {member.nick} 님
                                        </Text>
                                    </View>
                                )
                            }
                        })}
                    </View>
                </View>
        :
            <View style={styles.container}>
                <View style={styles.manContainer}>
                    <Text style={styles.manTitleText}>
                        남자
                    </Text>
                    {members.map((member, index) => {
                        if(member.sex === '남성'){
                            return(
                                <View key={member.uid + index} style={styles.manNickContainer}>
                                    <Text style={styles.manNickText}>
                                        {member.nick} 님
                                    </Text>
                                </View>
                            )
                        }
                    })}
                </View>
                <View style={styles.womanContainer}>
                    <Text style={styles.womanTitleText}>
                        여자
                    </Text>
                    {members.map((member, index) => {
                        if(member.sex === '여성'){
                            return(
                                <View key={member.uid + index} style={styles.womanNickContainer}>
                                    <Text style={styles.womanNickText}>
                                        {member.nick} 님
                                    </Text>
                                </View>
                            )
                        }
                    })}
                </View>
            </View>
    )
}
function buttonDraw(text, action = null, isAnswered, id = null, selectedNumber = -1){
    const styles = StyleSheet.create({
        container: {
            borderWidth: 1,
            borderColor: '#222222',
            padding: 10,
            borderRadius: 10,
            backgroundColor: '#CDF0EA',
            marginBottom: 10
        },
        text: {
            fontSize: 16,
            textAlign: 'center'
        },
        selectedText: {
            fontSize: 16,
            textAlign: 'center',
            color: 'red'
        },
        unSelectedText: {
            fontSize: 16,
            textAlign: 'center',
            color: '#cccccc'
        }
    })
    if(isAnswered){
        return(
            <View 
                style={styles.container}
            >
                <Text style={selectedNumber === -1 ? 
                                styles.text 
                            :
                                id === selectedNumber ? 
                                    styles.selectedText 
                                : 
                                    styles.unSelectedText
                }>
                    {text}
                </Text>
            </View>
        )
    }else{
        return(
            <TouchableOpacity 
                onPress={action} 
                style={styles.container}
            >
                <Text style={selectedNumber === -1 ? 
                                styles.text 
                            :
                                id === selectedNumber ? 
                                    styles.selectedText 
                                : 
                                    styles.unSelectedText
                }>
                    {text}
                </Text>
            </TouchableOpacity>
        )
    }
}
function leftTimeDraw(time){
    const styles = StyleSheet.create({
        text: {
            fontSize: 20, 
            textAlign: 'center'
        }
    })
    return(
        <View>
            <Text style={styles.text}>
                시간이 {time} 초 남았습니다.
            </Text>
        </View>
    )
}

const db = fb.firestore();
const realdb = fb.database();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#67abff',
        paddingTop: 5
    }
})

class MeetingRoom extends Component {
    constructor(props){
        super(props);
        this.state = {
            myMemberData: this.props.route.params.memberData,
            room: this.props.route.params.roomData,
            memberId: this.props.route.params.memberId,
            roomId: this.props.route.params.roomId,
            message: [],
            textInput: '',
            members: [],

            keyboard: false,

            selectedNumber: -1,
            isAnswered: false,
            maxQuestionCount: 10,
            timer: 30,
            plusChatTimerStart: false,
            choiceTimerStart: false
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
            this.setState({room}, () => this.meetingStatusControl(room));
        })
        // 이 방의 message 구독
        this.unsubscribeMessageUpdate = db.doc(`rooms/${roomId}`).collection("message").orderBy("time").onSnapshot((querySnapshot) => {
            const message = querySnapshot.docs.map((doc, index) => {
                return doc.data()
            })
            this.setState({message})
        })
        // 모든 멤버 구독
        this.unsubscribeMembersDataUpdate = db.collection(`rooms/${roomId}/member`).onSnapshot((querySnapshot) => {
            const members = querySnapshot.docs.map((doc, index) => {
                return doc.data()
            })
            this.setState({members})
        })
        // 뒤로 가기 누르는 이벤트 등록
        this.unsubscribeNavigation = this.props.navigation.addListener("beforeRemove", () => {
            this.roomOut()
            clearInterval(this.inter)
        })
        // 키보드 생성시 이벤트 등록
        Keyboard.addListener("keyboardDidShow", () => {
            this.setState({
                keyboard: true
            })
            setTimeout(this.toBottom, 100)
        })
        Keyboard.addListener("keyboardDidHide", () => {
            this.setState({
                keyboard: false
            })
        })
    }
    componentWillUnmount(){
        this.unsubscribeMyMemberDataUpdate();
        this.unsubscribeRoomDataUpdate();
        this.unsubscribeMessageUpdate();
        this.unsubscribeMembersDataUpdate();
        this.unsubscribeNavigation();
        Keyboard.removeAllListeners("keyboardDidShow");
        Keyboard.removeAllListeners("keyboardDidHide");
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
        if(textInput !== ''){
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
    }
    robotChat = (msg) => {
        db.doc(`rooms/${this.state.roomId}`).collection("message").add({
            who: 'n5dCczQosxbCYpnmpZvZCzdy4Xx2',
            content: msg,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            type: "bot",
            profilePhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/naturalmeeting-2e64a.appspot.com/o/n5dCczQosxbCYpnmpZvZCzdy4Xx2%2FprofilePhoto.png?alt=media&token=76868e33-c956-460c-8d58-999333b35b05',
            nick: `Ai 쟈만츄`
        })
    }
    roomOut = async () => {
        const { roomId, memberId, room, myMemberData } = this.state;
        await db.doc(`rooms/${roomId}/member/${memberId}`).delete();
        if(room.man + room.woman === 1){
            const querySnapshot = await db.doc(`rooms/${roomId}`).collection("message").get();
            querySnapshot.forEach((queryDocumentSnapshot) => {
                queryDocumentSnapshot.ref.delete();
            })
            await db.doc(`rooms/${roomId}`).delete()
        }else{
            const sexCount = myMemberData.sex === "남성" ? { man: room.man - 1 } : { woman: room.woman - 1 };
            let newStatus = room.status;
            let newMaster = room.master;
            if(room.man + room.woman === 2){
                if(room.status === 0){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 0;
                        const leftMemberSnapshot = await db.collection("rooms").doc(roomId).collection("member").orderBy("time").get()
                        newMaster = leftMemberSnapshot.docs[0].data();
                    }else{
                        newStatus = 0;
                    }
                }else if(room.status === 1){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 3;
                    }else{
                        newStatus = 3;
                    }
                }else if(room.status === 2){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 0;
                        const leftMemberSnapshot = await db.collection("rooms").doc(roomId).collection("member").orderBy("time").get()
                        newMaster = leftMemberSnapshot.docs[0].data();
                    }else{
                        newStatus = 0;
                    }
                }else if(room.status === 3){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 3;
                    }else{
                        newStatus = 3;
                    }
                }
            }else{
                if(room.status === 0){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 0;
                        const leftMemberSnapshot = await db.collection("rooms").doc(roomId).collection("member").orderBy("time").get()
                        newMaster = leftMemberSnapshot.docs[0].data();
                    }else{
                        newStatus = 0;
                    }
                }else if(room.status === 1){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 1;
                        const leftMemberSnapshot = await db.collection("rooms").doc(roomId).collection("member").orderBy("time").get()
                        newMaster = leftMemberSnapshot.docs[0].data();
                    }else{
                        newStatus = 1;
                    }
                }else if(room.status === 2){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 0;
                        const leftMemberSnapshot = await db.collection("rooms").doc(roomId).collection("member").orderBy("time").get()
                        newMaster = leftMemberSnapshot.docs[0].data();
                    }else{
                        newStatus = 0;
                    }
                }else if(room.status === 3){
                    if(room.master.uid === myMemberData.uid){
                        newStatus = 3;
                    }else{
                        newStatus = 3;
                    }
                }
            }
            await db.doc(`rooms/${roomId}`).update({status: newStatus, master: newMaster, ...sexCount });
            await db.doc(`rooms/${roomId}`).collection("message").add({
                who: "system",
                type: "system",
                content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                time:  firebase.firestore.FieldValue.serverTimestamp()
            })
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
    meetingStatusControl = (room) => {
        if(
            (room.status === 0 || room.status === 2) &&
            room.questionStatus === 0 &&
            room.man === room.woman && 
            room.man + room.woman >= 4 &&
            room.master.uid === this.state.myMemberData.uid
        ){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 1
            })
            return;
        }
        else if(
            (room.status === 0 || room.status === 2) &&
            room.questionStatus === 1 &&
            (room.man !== room.woman || room.man + room.woman < 4) && 
            room.master.uid === this.state.myMemberData.uid
        ){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 0
            })
            return;
        }
        else if(room.questionStatus === 2 && this.state.plusChatTimerStart === false){
            this.setState({
                plusChatTimerStart: true
            }, () => this.countDownTimer())
            return;
        }
        else if(room.questionStatus === 2 && (room.woman + room.man) / 2 <= room.agree.length){
            this.plus(room)
            return;
        }
        else if(room.questionStatus === 2 && (room.woman + room.man) / 2 <= room.disagree.length){
            if(room.master.uid === this.state.myMemberData.uid){
                db.doc(`rooms/${this.state.roomId}`).update({
                    questionStatus: 3,
                    agree: [],
                    disagree: []
                })
            }
        }
        else if(room.questionStatus === 3 && this.state.choiceTimerStart === false){
            this.setState({
                timer: 30,
                isAnswered: false,
                selectedNumber: -1,
                choiceTimerStart: true
            })
        }
        else if(room.questionStatus === 99){
            this.setState({
                timer: 30,
                isAnswered: false,
                plusChatTimerStart: false,
                selectedNumber: -1
            })
            return;
        }
        else if(room.status === 3){
            clearInterval(this.inter)
            this.setState({
                maxQuestionCount: 10,
                isAnswered: false,
                selectedNumber: -1,
                timer: 30,
                plusChatTimerStart: false,
                choiceTimerStart: false
            })
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 4
            })
            return;
        }
    }
    start = () => {
        this.setState({
            isAnswered: true
        }, () => {
            const { roomId } = this.state;
            const idx = Math.floor(Math.random() * meetingQuestionDB.length);
            db.doc(`rooms/${roomId}`).update({
                questionList: [idx],
                questionStatus: 99,
                status: 1
            }).then(res => this.setState({isAnswered: false}))
        })
    }
    next = () => {
        this.setState({
            isAnswered: true
        }, () => {
            const { roomId, room, maxQuestionCount } = this.state;
            const idxs = room.questionList;
            if(room.questionList.length < meetingQuestionDB.length && room.questionList.length < maxQuestionCount){
                let flag = true;
                while(flag){
                    const idx = Math.floor(Math.random() * meetingQuestionDB.length);
                    if(idxs.indexOf(idx) === -1){
                        db.doc(`rooms/${roomId}`).update({
                            questionList: [idx,...room.questionList],
                            questionStatus: 99
                        }).then(res => this.setState({isAnswered: false}))
                        flag = false;
                    }
                }
            }else if(room.questionList.length >= maxQuestionCount){
                db.doc(`rooms/${roomId}`).update({
                    questionStatus: 2
                }).then(res => this.setState({isAnswered: false}))
            }else if(room.questionList.length >= meetingQuestionDB.length){
                db.doc(`rooms/${roomId}`).update({
                    questionStatus: 3
                }).then(res => this.setState({isAnswered: false}))
            }
        })
    }
    countDownTimer = () => {
        this.inter = setInterval(() => {
            if(this.state.timer > 0) {
                this.setState((prevState) => {
                    return({
                        timer: prevState.timer - 1,
                    })
                })
            }else {
                if(this.state.room.questionStatus === 2){
                    if(this.state.room.agree.length > this.state.room.disagree.length){
                        this.plus(this.state.room)
                    }else{
                        if(this.state.room.master.uid === this.state.myMemberData.uid){
                            db.doc(`rooms/${this.state.roomId}`).update({
                                questionStatus: 3,
                                agree: [],
                                disagree: []
                            })
                        }
                    }
                }else if(this.state.room.questionStatus === 3){
                    this.check()
                }
            }
        }, 1000)
    }
    agree = (bool, index) => {
        this.setState({
            isAnswered: true,
            selectedNumber: index
        }, () => {
            const { roomId, room, myMemberData } = this.state;
            const agree = room.agree;
            const disagree = room.disagree;
            const agreeIdx = agree.indexOf(myMemberData.uid);
            const disagreeIdx = disagree.indexOf(myMemberData.uid);
            if(agreeIdx === -1 && disagreeIdx === -1){
                if(bool){
                    db.doc(`rooms/${roomId}`).update({
                        agree: [...agree, myMemberData.uid]
                    })
                }else{
                    db.doc(`rooms/${roomId}`).update({
                        disagree: [...disagree, myMemberData.uid]
                    })
                }
            }
        })
    }
    plus = (room) => {
        clearInterval(this.inter)
        const list =  meetingQuestionDB;
        this.setState((prevState) => {
            return {
                maxQuestionCount: prevState.maxQuestionCount + 5,
            }
        }, () => {
            if(this.state.myMemberData.uid === room.master.uid){
                const idxs = room.questionList;
                let flag = true;
                while(flag){
                    const idx = Math.floor(Math.random() * list.length);
                    if(idxs.indexOf(idx) === -1){
                        db.doc(`rooms/${this.state.roomId}`).update({
                            questionList: [idx,...room.questionList],
                            questionStatus: 99,
                            agree: [],
                            disagree: []
                        })
                        flag = false;
                    }
                }
            }
        })
    }
    choice = (uid, index) => {
        this.setState({
            selectedNumber: index,
            isAnswered: true
        })
        db.doc(`rooms/${this.state.roomId}/member/${this.state.memberId}`).update({
            choice: uid
        })
    }
    check = async () => {
        const { myMemberData, members, roomId } = this.state;
        members.map( async (member, index) => {
            if(member.sex !== myMemberData.sex){
                if(myMemberData.uid === member.choice && myMemberData.choice === member.uid){
                    const myRef = await db.doc(`users/${myMemberData.docId}`).get();
                    const myFriendList = myRef.data().friends;
                    const indexOfNum = myFriendList.findIndex((elem, index, array) => elem.uid === member.uid);
                    if(indexOfNum === -1){
                        await db.doc(`users/${myMemberData.docId}`).update({friends: [...myFriendList, {nick: member.nick, uid: member.uid}]});
                        const storeUser = store.getState().user;
                        store.dispatch({ type: 'user', user: {...storeUser, friends: [...myFriendList, {nick: member.nick, uid: member.uid}]}});
                        await db.doc(`rooms/${roomId}`).collection("message").add({
                            who: myMemberData.uid,
                            content: `${member.nick}님을 친구로 등록했어요!`,
                            time: firebase.firestore.FieldValue.serverTimestamp(),
                            type: "chat",
                            profilePhotoUrl: myMemberData.profilePhotoUrl_open === 0 ? myMemberData.profilePhotoUrl : null,
                            nick: myMemberData.nick_open === 0 ? myMemberData.nick: "?",
                            job: myMemberData.job_open === 0 ? myMemberData.job : "?",
                            address_0: myMemberData.address_open === 0 ? myMemberData.address_0 : "?",
                            sex: myMemberData.sex
                        })
                    }else {
                        alert(`${member.nick}님과 이미 친구입니다.`);
                    }
                } 
            }
        })
        await db.doc(`rooms/${roomId}`).update({
            status: 3
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
                    <>
                        {
                            stickyDraw(meetingQuestionDB, this.state.room.questionList[0], this.state.room.questionList)
                        }
                        {
                            this.state.keyboard || tableDraw(this.state.members, this.state.room.questionStatus, this.state.myMemberData.sex, this.choice, this.state.selectedNumber, this.state.isAnswered)
                        }
                        {
                            this.state.room.master.uid === this.state.myMemberData.uid && 
                            buttonDraw('다음 대화 주제', this.next, this.state.isAnswered) 
                        }
                    </> 
                :
                    <>
                        {
                            stickyDraw(meetingNoticeDB, this.state.room.questionStatus, null)
                        }
                        {
                            this.state.keyboard || tableDraw(this.state.members, this.state.room.questionStatus, this.state.myMemberData.sex, this.choice, this.state.selectedNumber, this.state.isAnswered)
                        }
                        {
                            this.state.room.questionStatus === 1 &&
                            this.state.room.master.uid === this.state.myMemberData.uid &&
                            buttonDraw('시작하기', this.start, this.state.isAnswered) 
                        }
                        {
                            this.state.room.questionStatus === 2 &&
                                <>
                                    {buttonDraw(
                                        '추가 대화 주제를 받는다', 
                                        () => this.agree(true, 0), 
                                        this.state.isAnswered,
                                        0 , 
                                        this.state.selectedNumber
                                    )}
                                    {buttonDraw(
                                        '추가 대화 주제를 받지 않는다', 
                                        () => this.agree(false, 1), 
                                        this.state.isAnswered,
                                        1 , 
                                        this.state.selectedNumber
                                    )}
                                    {leftTimeDraw(this.state.timer)}
                                </> 
                        }
                        {this.state.room.questionStatus === 3 && leftTimeDraw(this.state.timer)}
                    </>
                }
                {this.state.message.length !== 0 && 
                    this.state.message.map((msg, index) => {
                        if(msg.time >= this.state.myMemberData.time){
                            return(
                                messageDraw(msg, index, this.state.myMemberData.uid, this.state.message)
                            )
                        }
                    })
                }
                </ScrollView>
                {textInputDraw(this.state.textInput, this.onChangeTextInput, this.sendMessage)}
            </View>
        )
    }
}

export default MeetingRoom;