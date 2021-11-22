import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import Logo from '../assets/logo.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from 'firebase/app';
import { minimalizeAddressDB, sogaetingNoticeDB, sogaetingQuestionDB } from '../dbs';
import store from '../store';
import fb from '../fb';

const db = fb.firestore();
const realdb = fb.database();
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
            maxQuestionCount: 10,
            timer: 0,
            isAnswered: false
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
            this.setState({room}, () => this.sogaetingStatusControl(room));
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
            clearTimeout(this.inter)
        })
        // 키보드 생성시 이벤트 등록
        Keyboard.addListener("keyboardDidShow", () => {
            setTimeout(this.toBottom, 100)
        })
        this.countDownTimer()
    }
    componentWillUnmount(){
        this.unsubscribeMyMemberDataUpdate();
        this.unsubscribeRoomDataUpdate();
        this.unsubscribeMessageUpdate();
        this.unsubscribeNavigation();
        Keyboard.removeAllListeners("keyboardDidShow");
        clearTimeout(this.inter)
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
                await db.doc(`rooms/${roomId}`).update({ status: 3, questionStatus: 4, ...sexCount });
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
            }else if(room.status === 2){
                await db.doc(`rooms/${roomId}`).update({ status: 0, ...sexCount });
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                    time:  firebase.firestore.FieldValue.serverTimestamp()
                })
            }else if(room.status === 1){
                await db.doc(`rooms/${roomId}`).update({ status: 3, questionStatus: 4, ...sexCount });
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                    time:  firebase.firestore.FieldValue.serverTimestamp()
                })
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: "system",
                    type: "system",
                    content: `진행중에 ${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하여 방이 종료됩니다.`,
                    time:  firebase.firestore.FieldValue.serverTimestamp()
                })
            }else {
                await db.doc(`rooms/${roomId}`).update({...sexCount });
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
    countDownTimer = () => {
        this.inter = setInterval(() => {
            this.setState((prevState) => {
                return({
                    timer: prevState.timer - 1
                })
            }, () => {
                if(
                    this.state.room.status === 1 &&
                    this.state.room.questionStatus === 99 &&
                    this.state.timer < -2 &&
                    this.state.room.master.uid === this.state.myMemberData.uid
                ){
                    // if(this.state.room.questionList.length < this.state.maxQuestionCount){
                    //     this.robotChat(`시간 초과!! ${this.state.room.questionList.length + 1} 번째 주제로 넘어갑니다.`)
                    // }else if(this.state.room.questionList.length === this.state.maxQuestionCount){
                    //     this.robotChat(`시간 초과!! 추가로 더 대화할래요?`)
                    // }
                    this.next()
                }
                else if(
                    this.state.room.status === 1 &&
                    this.state.room.questionStatus === 2 &&
                    this.state.timer < -2 &&
                    this.state.room.master.uid === this.state.myMemberData.uid
                ){
                    // this.robotChat(`시간 초과!! 대화 종료...`)
                    if(this.state.room.questionStatus !== 3){
                        db.doc(`rooms/${this.state.roomId}`).update({
                            questionStatus: 3,
                            masterAnswer: '',
                            guestAnswer: ''
                        })
                    }
                }
                else if(
                    this.state.room.status === 1 &&
                    this.state.room.questionStatus === 3 &&
                    this.state.timer < -2 &&
                    this.state.room.master.uid === this.state.myMemberData.uid
                ){
                    // this.robotChat(`시간 초과!! 친구 등록이 취소되었습니다. 소개팅이 종료되었습니다.`)
                    db.doc(`rooms/${this.state.roomId}`).update({
                        status: 3,
                        questionStatus: 4
                    })
                }
            })
            
        }, 1000)
    }
    sogaetingStatusControl = (room) => {
        if(
            room.status === 2 && 
            room.questionStatus === 0 && 
            this.state.timer <= 0 &&
            room.master.uid === this.state.myMemberData.uid
        ){
            // this.robotChat(`방장이 시작버튼을 누루면 소개팅이 시작됩니다.`)
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 1 
            })
            return;
        }
        else if(
            room.status === 0 &&
            room.questionStatus === 1 &&
            this.state.timer <= 0 &&
            room.master.uid === this.state.myMemberData.uid
        ){
            // this.robotChat(`대기 상태로 전환합니다. 상대방이 입장할때까지 기다려주세요.`)
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 0 
            })
            return;
        }
        else if(
            room.status === 1 &&
            room.questionStatus === 99 &&
            (this.state.room.masterAnswer === '' && this.state.room.guestAnswer === '')
        ){
            // if(room.master.uid === this.state.myMemberData.uid){
            //     this.robotChat(`${room.questionList.length} 번째 대화 시작!!!`)
            // }
            this.setState({timer: 180, isAnswered: false})
        }
        else if(
            room.status === 1 &&
            room.questionStatus === 99 &&
            this.state.timer >= 0 &&
            (this.state.room.masterAnswer !== '' && this.state.room.guestAnswer !== '') &&
            room.master.uid === this.state.myMemberData.uid
        ){
            // if(room.questionList.length < this.state.maxQuestionCount){
            //     this.robotChat(`모두 동의해서 ${room.questionList.length + 1} 번째 주제로 넘어갑니다.`)
            // }
            this.next()
        }
        else if(
            room.status === 1 &&
            room.questionStatus === 2 &&
            (this.state.room.masterAnswer === '' && this.state.room.guestAnswer === '')
        ){
            // if(room.master.uid === this.state.myMemberData.uid){
            //     this.robotChat(`추가로 더 대화할래요?`)
            // }
            this.setState({timer: 30, isAnswered: false})
        }
        else if(
            room.status === 1 &&
            room.questionStatus === 2 &&
            this.state.timer >= 0 &&
            (this.state.room.masterAnswer !== '' && this.state.room.guestAnswer !== '')
        ){
            // if(room.master.uid === this.state.myMemberData.uid){
            //     this.robotChat(`모두 동의해서 추가대화 합니다.`)
            // }
            this.plusQuestion(room)
        }
        else if(
            room.status === 1 &&
            room.questionStatus === 3 &&
            (this.state.room.masterAnswer === '' && this.state.room.guestAnswer === '')
        ){
            // if(room.master.uid === this.state.myMemberData.uid){
            //     this.robotChat(`친구 등록 할래요?`)
            // }
            this.setState({timer: 60, isAnswered: false})
        }
        else if(
            room.status === 1 &&
            room.questionStatus === 3 &&
            this.state.timer >= 0 &&
            (this.state.room.masterAnswer !== '' && this.state.room.guestAnswer !== '')
        ){
            // if(room.master.uid === this.state.myMemberData.uid){
            //     this.robotChat(`모두 동의해서 친구 등록 합니다.`)
            // }
            this.friendRegister()
        }
    }
    start = () => {
        const { roomId } = this.state;
        const idx = Math.floor(Math.random() * sogaetingQuestionDB.length);
        db.doc(`rooms/${roomId}`).update({
            questionList: [idx],
            questionStatus: 99,
            masterAnswer: '',
            guestAnswer: '',
            status: 1
        })
    }
    answer = () => {
        const { room, roomId, myMemberData} = this.state;
        if(room.master.uid === myMemberData.uid){
            db.doc(`rooms/${roomId}`).update({
                masterAnswer: myMemberData.uid
            })
        }else{
            db.doc(`rooms/${roomId}`).update({
                guestAnswer: myMemberData.uid
            })
        }
    }
    next = () => {
        const { roomId, room, maxQuestionCount } = this.state;
        const idxs = room.questionList;
        if(room.questionList.length < sogaetingQuestionDB.length && room.questionList.length < maxQuestionCount){
            let flag = true;
            while(flag){
                const idx = Math.floor(Math.random() * sogaetingQuestionDB.length);
                if(idxs.indexOf(idx) === -1){
                    db.doc(`rooms/${roomId}`).update({
                        questionList: [idx,...room.questionList],
                        questionStatus: 99,
                        masterAnswer: '',
                        guestAnswer: ''
                    })
                    flag = false;
                }
            }
        }else if(room.questionList.length >= maxQuestionCount){
            db.doc(`rooms/${roomId}`).update({
                questionStatus: 2,
                masterAnswer: '',
                guestAnswer: ''
            })
        }else if(room.questionList.length >= sogaetingQuestionDB.length){
            db.doc(`rooms/${roomId}`).update({
                questionStatus: 3,
                masterAnswer: '',
                guestAnswer: ''
            })
        }
    }
    plusQuestionAnswer = (bool) => {
        const { roomId, room, myMemberData } = this.state;
        if(bool){
            if(room.master.uid === myMemberData.uid){
                db.doc(`rooms/${roomId}`).update({
                    masterAnswer: myMemberData.uid
                })
            }else{
                db.doc(`rooms/${roomId}`).update({
                    guestAnswer: myMemberData.uid
                })
            }
        }else if(bool === false){
            if(room.questionStatus !== 3){
                db.doc(`rooms/${roomId}`).update({
                    questionStatus: 3,
                    masterAnswer: '',
                    guestAnswer: '',
                })
                this.robotChat(`${this.state.myMemberData.nick} 님이 추가 주제 받기를 거절 하였습니다.`)
            }
        }
    }
    plusQuestion = (room) => {
        this.setState((prevState) => {
            return {
                maxQuestionCount: prevState.maxQuestionCount + 5
            }
        }, () => {
            if(room.master.uid === this.state.myMemberData.uid){
                const list =  sogaetingQuestionDB;
                const idxs = room.questionList;
                let flag = true;
                while(flag){
                    const idx = Math.floor(Math.random() * list.length);
                    if(idxs.indexOf(idx) === -1){
                        db.doc(`rooms/${this.state.roomId}`).update({
                            questionList: [idx,...room.questionList],
                            questionStatus: 99,
                            masterAnswer: '',
                            guestAnswer: ''
                        })
                        flag = false;
                    }
                }
            }
        })
    }
    friendPlusAnswer = (bool) => {
        const { roomId, room, myMemberData } = this.state;
        if(bool){
            if(room.master.uid === myMemberData.uid){
                db.doc(`rooms/${roomId}`).update({
                    masterAnswer: myMemberData.uid
                })
            }else{
                db.doc(`rooms/${roomId}`).update({
                    guestAnswer: myMemberData.uid
                })
            }
        }else{
            if(room.status === 1){
                db.doc(`rooms/${roomId}`).update({
                    status: 3,
                    questionStatus: 4
                }).then(res => {
                    this.robotChat(`${this.state.myMemberData.nick} 님이 친구 등록을 거절하였습니다.`)
                })
            }
        }
    }
    friendRegister = async () => {
        const { roomId, memberId, myMemberData, room } = this.state;
        const allMemberRef = await db.collection(`rooms/${roomId}/member`).get();
        const myRef = await db.doc(`users/${myMemberData.docId}`).get();
        const myFriendList = myRef.data().friends;
        allMemberRef.docs.map(async (doc, index) => {
            const indexOfNum = myFriendList.indexOf(doc.data().uid)
            if(doc.id !== memberId && doc.data().sex !== myMemberData.sex && indexOfNum === -1){
                await db.doc(`users/${myMemberData.docId}`).update({friends: [...myFriendList, doc.data().uid]});
                const storeUser = store.getState().user;
                store.dispatch({ type: 'user', user: {...storeUser, friends: [...myFriendList, doc.data().uid]}});
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: myMemberData.uid,
                    content: `${doc.data().nick}님을 친구로 등록했어요!`,
                    time: firebase.firestore.FieldValue.serverTimestamp(),
                    type: "chat",
                    profilePhotoUrl: myMemberData.profilePhotoUrl_open === 0 ? myMemberData.profilePhotoUrl : null,
                    nick: myMemberData.nick_open === 0 ? myMemberData.nick: "?",
                    job: myMemberData.job_open === 0 ? myMemberData.job : "?",
                    address_0: myMemberData.address_open === 0 ? myMemberData.address_0 : "?",
                    sex: myMemberData.sex
                })
            }else if(doc.id !== memberId && doc.data().sex !== memberId.sex && indexOfNum !== -1){
                await db.doc(`rooms/${roomId}`).collection("message").add({
                    who: myMemberData.uid,
                    content: `${doc.data().nick}님과 이미 친구에요!!`,
                    time: firebase.firestore.FieldValue.serverTimestamp(),
                    type: "chat",
                    profilePhotoUrl: myMemberData.profilePhotoUrl_open === 0 ? myMemberData.profilePhotoUrl : null,
                    nick: myMemberData.nick_open === 0 ? myMemberData.nick: "?",
                    job: myMemberData.job_open === 0 ? myMemberData.job : "?",
                    address_0: myMemberData.address_open === 0 ? myMemberData.address_0 : "?",
                    sex: myMemberData.sex
                })
            }
        })
        if(room.master.uid === myMemberData.uid && room.status === 1){
            // this.robotChat(`소개팅이 종료되었습니다. 빨리 꺼져주세요`)
            await db.doc(`rooms/${roomId}`).update({
                status: 3,
                questionStatus: 4
            })
        }
    }
    robotChat = (msg) => {
        db.doc(`rooms/${this.state.roomId}`).collection("message").add({
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
                        <View style={styles.questionContainer}>
                            <Text style={styles.questionTitleText}>
                                {this.state.room.questionList.length}. {sogaetingQuestionDB[this.state.room.questionList[0]].title}
                            </Text>
                            {sogaetingQuestionDB[this.state.room.questionList[0]].selection.map((item, index) => {
                                return(
                                    <TouchableOpacity key={item+index}>
                                        <Text style={styles.questionSelectionText}>
                                            {index + 1}. {item}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                            {this.state.isAnswered || this.state.timer <= 0 ? 
                                <View 
                                    style={styles.questionButtonContainer}
                                >
                                    <Text style={styles.questionButtonTextAnswered}>
                                        ...
                                    </Text>
                                </View>
                            :
                                <TouchableOpacity 
                                    onPress={() => this.setState({isAnswered: true}, () => this.answer())} 
                                    style={styles.questionButtonContainer}
                                >
                                    <Text style={styles.questionButtonText}>
                                        다음..
                                    </Text>
                                </TouchableOpacity>
                            }
                            
                            <View>
                                {this.state.timer > 0 ? 
                                    <Text>
                                        {parseInt(this.state.timer / 60)}분 {this.state.timer % 60} 초 후 다음으로..
                                    </Text>
                                :
                                    <Text>
                                        시간이 초과되었습니다.
                                    </Text>
                                } 
                            </View> 
                        </View>
                    :
                        <View style={styles.questionContainer}>
                            <Text style={styles.questionTitleText}>
                                {sogaetingNoticeDB[this.state.room.questionStatus].title}
                            </Text>
                            {sogaetingNoticeDB[this.state.room.questionStatus].selection.map((item, index) => {
                                return(
                                    <View key={item+index}>
                                        <Text style={styles.questionSelectionText}>
                                            {index + 1}. {item}
                                        </Text>
                                    </View>
                                )
                            })}
                            {
                                this.state.room.status === 2 && 
                                this.state.room.questionStatus === 1 &&
                                this.state.room.master.uid === this.state.myMemberData.uid ?
                                    <TouchableOpacity 
                                        style={styles.questionButtonContainer}
                                        onPress={this.start} 
                                    >
                                        <Text style={styles.questionButtonText}>
                                            시작하기
                                        </Text>
                                    </TouchableOpacity> 
                            : 
                                null
                            }
                            {
                                this.state.room.questionStatus === 2 && 
                                this.state.room.status === 1 ?
                                    this.state.isAnswered || this.state.timer <= 0 ? 
                                        <View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonTextAnswered}>
                                                    추가 대화 주제를 받는다
                                                </Text>
                                            </View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonTextAnswered}>
                                                    추가 대화 주제를 받는지 않는다
                                                </Text>
                                            </View>
                                            <View>
                                                {this.state.timer > 0 ? 
                                                    <Text>
                                                        선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                    </Text>
                                                :
                                                    <Text>
                                                        시간이 초과되었습니다.
                                                    </Text>
                                                }
                                            </View>
                                        </View>
                                    :
                                        <View>
                                            <TouchableOpacity onPress={() => this.setState({isAnswered: true}, () => this.plusQuestionAnswer(true))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    추가 대화 주제를 받는다
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.setState({isAnswered: true}, () => this.plusQuestionAnswer(false))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    추가 대화 주제를 받는지 않는다
                                                </Text>
                                            </TouchableOpacity>
                                            <View>
                                                <Text>
                                                    선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                </Text>
                                            </View>
                                        </View> 
                            : 
                                null
                            }
                            {
                                this.state.room.questionStatus === 3 && 
                                this.state.room.status === 1 ?
                                    this.state.isAnswered || this.state.timer <= 0 ? 
                                        <View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonTextAnswered}>
                                                    친구로 등록한다.
                                                </Text>
                                            </View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonTextAnswered}>
                                                    친구로 등록하지 않는다.
                                                </Text>
                                            </View>
                                            <View>
                                                {this.state.timer > 0 ? 
                                                    <Text>
                                                        선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                    </Text>
                                                :
                                                    <Text>
                                                        시간이 초과되었습니다.
                                                    </Text>
                                                }
                                            </View>
                                        </View>
                                    :
                                        <View>
                                            <TouchableOpacity onPress={() => this.setState({isAnswered: true}, () => this.friendPlusAnswer(true))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    친구로 등록한다.
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.setState({isAnswered: true}, () => this.friendPlusAnswer(false))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    친구로 등록하지 않는다.
                                                </Text>
                                            </TouchableOpacity>
                                            <View>
                                                <Text>
                                                    선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                </Text>
                                            </View>
                                        </View> 
                            : 
                                null
                            }
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
                                                    msg.type === 'chat' || msg.type === 'bot' ?
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
                                                        msg.type === 'bot' ?
                                                            this.state.message[index].who !== this.state.message[index - 1].who ? 
                                                                <Text style={{fontSize: 16}}>
                                                                    {msg.nick}
                                                                </Text>
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
    questionButtonContainer: {
        borderWidth: 1,
        borderColor: '#222222',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#CDF0EA',
        marginBottom: 10
    },
    questionButtonText: {
        fontSize: 16,
        textAlign: 'center'
    },
    questionButtonTextAnswered: {
        fontSize: 16,
        textAlign: 'center',
        color: '#cccccc'
    }
})
export default Room;