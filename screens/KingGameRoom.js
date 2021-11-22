import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import Logo from '../assets/logo.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import fb from '../fb';
import firebase from 'firebase/app';
import { minimalizeAddressDB, kingGameQuestionDB, kingGameNoticeDB  } from '../dbs';
import store from '../store';
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
            members: [],
            textInput: '',
            standYear: new Date(Date.now()).getFullYear() + 1,
            maxQuestionCount: 10,
            isAnswered: false,
            timer: 30,
            selectedNumber: -1,
            timerStart: false
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
            this.setState({room}, () => this.kingGameStatusControl(room));
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
        // 모든 멤버 구독
        this.unsubMembers = db.collection(`rooms/${roomId}/member`).onSnapshot((querySnapshot) => {
            const members = querySnapshot.docs.map((doc, index) => {
                return doc.data()
            })
            this.setState({members})
        })
    }
    componentWillUnmount(){
        this.unsubscribeMyMemberDataUpdate();
        this.unsubscribeRoomDataUpdate();
        this.unsubscribeMessageUpdate();
        this.unsubscribeNavigation();
        Keyboard.removeAllListeners("keyboardDidShow");
        this.unsubMembers()
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
                await db.doc(`rooms/${roomId}`).update({ status: 3, questionStatus: 6, ...sexCount });
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
                if(room.status === 2){
                    await db.doc(`rooms/${roomId}`).update({ status: 0, ...sexCount });
                    await db.doc(`rooms/${roomId}`).collection("message").add({
                        who: "system",
                        type: "system",
                        content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                        time:  firebase.firestore.FieldValue.serverTimestamp()
                    })
                }else if(room.status === 1 && room.man + room.woman === 2){
                    await db.doc(`rooms/${roomId}`).update({ status: 3, questionStatus: 6, ...sexCount });
                    await db.doc(`rooms/${roomId}`).collection("message").add({
                        who: "system",
                        type: "system",
                        content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                        time:  firebase.firestore.FieldValue.serverTimestamp()
                    })
                }else{
                    await db.doc(`rooms/${roomId}`).update({...sexCount });
                    await db.doc(`rooms/${roomId}`).collection("message").add({
                        who: "system",
                        type: "system",
                        content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} 님이 퇴장하였습니다.`,
                        time:  firebase.firestore.FieldValue.serverTimestamp()
                    })
                }
                
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
    kingGameStatusControl = (room) => {
        if( room.man + room.woman >= 2 &&
            room.questionStatus === 0 &&
            room.master.uid === this.state.myMemberData.uid // 0 -> 1
        ){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 1
            })
            return;
        }
        else if(  
            room.man + room.woman === 1 &&
            room.questionStatus === 1 &&
            room.master.uid === this.state.myMemberData.uid // 1 -> 0
        ){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 0
            })
            return;
        }else if(
            room.status === 1 &&
            room.questionStatus === 5 &&
            this.state.timerStart === false &&
            (
                this.state.room.selectedMember.uid === this.state.myMemberData.uid ||
                this.state.room.master.uid === this.state.myMemberData.uid
            )
        ){
            this.setState({
                selectedNumber: -1, 
                isAnswered: false,
                timer: 30,
                timerStart: true
            }, () => { this.countDownTimer() })
        }else if(
            room.status === 1 &&
            room.questionStatus === 5 &&
            this.state.timerStart === true &&
            room.master.uid === this.state.myMemberData.uid &&
            (this.state.room.masterAnswer !== '' && this.state.room.guestAnswer !== '')
        ){
            this.friendRegister(room)
        }else if(
            room.status === 3 &&
            room.questionStatus !== 6
        ){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 6
            })
        }
    }
    start = () => {
        db.doc(`rooms/${this.state.roomId}`).update({
            questionStatus: 2,
            status: 1
        }).then(res => this.setState({isAnswered: false}, () => this.introduce()));
    }
    introduce = () => {
        const { job, school, age, address_0, heightCentimeter, religion, earnPerYear, family, drink, smoke, bodyForm, style } = this.state.room.master;
        setTimeout(() => this.robotChat(`방장의 직업은 ${job} 입니다.`), 0)
        setTimeout(() => this.robotChat(`방장의 출신학교는 ${school} 입니다.`), 1000)
        setTimeout(() => this.robotChat(`방장의 나이는 ${this.state.standYear - age.toDate().getFullYear()} 살(${age.toDate().getFullYear()}년생) 입니다.`), 2000)
        setTimeout(() => this.robotChat(`방장의 지역은 ${address_0} 입니다.`), 3000)
        setTimeout(() => this.robotChat(`방장의 키는 ${heightCentimeter} 입니다.`), 4000)
        setTimeout(() => this.robotChat(`방장의 종교는 ${religion} 입니다.`), 5000)
        setTimeout(() => this.robotChat(`방장의 연봉은 ${earnPerYear || "미입력"} 입니다.`), 6000)
        setTimeout(() => this.robotChat(`방장의 가족관계는 ${family ? family[0] + '남 '+ family[1]+'녀 중 ' + family[2]+'째 ': "미입력"} 입니다.`), 7000)
        setTimeout(() => this.robotChat(`방장의 음주는 ${drink || "미입력"} 입니다.`), 8000)
        setTimeout(() => this.robotChat(`방장의 흡연은 ${smoke || "미입력"} 입니다.`), 9000)
        setTimeout(() => this.robotChat(`방장의 체형은 ${bodyForm || "미입력"} 입니다.`), 10000)
        setTimeout(() => this.robotChat(`방장의 스타일은 ${style || "미입력"} 입니다.`), 11000)
        setTimeout(() => this.robotChat(`방장의 소개가 끝났습니다.`), 12000)
        setTimeout(() => {
            const idx = Math.floor(Math.random() * kingGameQuestionDB.length);
            db.doc(`rooms/${this.state.roomId}`).update({
                questionList: [idx],
                questionStatus: 99,
            })
        }, 13000)
    }
    next = (choice) => {
        this.robotChat(`이번 대화는 ${choice} 님이 제일 맘에 들어요.`)
        const { roomId, room, maxQuestionCount } = this.state;
        const idxs = room.questionList;
        if(room.questionList.length < kingGameQuestionDB.length && room.questionList.length < maxQuestionCount){
            let flag = true;
            while(flag){
                const idx = Math.floor(Math.random() * kingGameQuestionDB.length);
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
                questionStatus: 3
            }).then(res => this.setState({isAnswered: false}, () => this.countDownTimer()))
        }else if(room.questionList.length >= kingGameQuestionDB.length){
            db.doc(`rooms/${roomId}`).update({
                questionStatus: 4
            }).then(res => this.setState({isAnswered: false}, () => this.countDownTimer()))
        }
    }
    countDownTimer = () => {
        this.inter = setInterval(() => {
            console.log("타이머", this.state.timer, this.state.myMemberData.nick, this.state.room.status, this.state.room.questionStatus, Date.now())
            if(this.state.timer > 0){
                this.setState((prevState) => {
                    return({
                        timer: prevState.timer - 1,
                    })
                })
            }else{
                if(
                    this.state.room.status === 3 && this.state.room.questionStatus === 6
                ){
                    clearInterval(this.inter)
                }else if(
                    this.state.room.status === 1 && 
                    this.state.room.questionStatus === 3 && 
                    this.state.room.master.uid === this.state.myMemberData.uid
                ){
                    this.setState({timer: 30, isAnswered: false})
                    db.doc(`rooms/${this.state.roomId}`).update({
                        questionStatus: 4
                    })
                }else if(
                    this.state.room.status === 1 && 
                    this.state.room.questionStatus === 4 && 
                    this.state.room.master.uid === this.state.myMemberData.uid
                ){
                    this.winnerUnChoice()
                }
            }
        }, 1000)
    }
    plusQuestionSelect = async (bool) => {
        if(bool){
            if(this.state.myMemberData.point < 10000){
                alert("포인트가 부족합니다.")
                this.setState({isAnswered: false})
                return;
            }
            const newPoint = this.state.myMemberData.point - 10000;
            const newPrize = this.state.room.point + 10000;
            const storeUser = store.getState().user
            await db.doc(`users/${this.state.myMemberData.docId}`).update({
                point: newPoint
            })
            await db.doc(`rooms/${this.state.roomId}/member/${this.state.memberId}`).update({
                point: newPoint
            })
            await db.doc(`rooms/${this.state.roomId}`).update({
                point: newPrize,
                master: {...this.state.room.master, point: newPoint}
            })
            store.dispatch({ type: 'user', user: {...storeUser, point: newPoint}});
            this.plusQuestion()
        }else {
            this.setState({timer: 30, isAnswered: false})
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 4
            })
        }
    }
    plusQuestion = () => {
        clearInterval(this.inter);
        const { room } = this.state;
        const list =  kingGameQuestionDB;
        this.setState((prevState) => {
            return {
                maxQuestionCount: prevState.maxQuestionCount + 5
            }
        }, () => {
            const idxs = room.questionList;
            let flag = true;
            while(flag){
                const idx = Math.floor(Math.random() * list.length);
                if(idxs.indexOf(idx) === -1){
                    db.doc(`rooms/${this.state.roomId}`).update({
                        questionList: [idx,...room.questionList],
                        questionStatus: 99
                    }).then(res => this.setState({
                        isAnswered: false,
                        timer: 30
                    }))
                    flag = false;
                }
            }
        })
    }
    winnerChoice = async (docId, uid) => {
        clearInterval(this.inter)
        const { myMemberData, members, room } = this.state;
        const allPoint = room.point;
        const FirstPrize = Math.floor(allPoint * 2 / 3);
        const leftPrize = Math.floor((allPoint - FirstPrize) / (members.length - 2));
        if(members.length === 2){
            members.map((member, index) => {
                if(member.docId === docId){
                    db.doc(`users/${member.docId}`).update({
                        point: member.point + allPoint
                    }).then(res => {
                        this.robotChat(`${member.nick}에게 ${allPoint} 포인트를 지급하였습니다.`)
                    })
                }
            })
        }else{
            members.map((member, index) => {
                if(member.docId === docId){
                    db.doc(`users/${member.docId}`).update({
                        point: member.point + FirstPrize
                    }).then(res => {
                        this.robotChat(`${member.nick}에게 ${FirstPrize} 포인트를 지급하였습니다.`)
                    })
                }else if(member.docId !== myMemberData.docId){
                    db.doc(`users/${member.docId}`).update({
                        point: member.point + leftPrize
                    }).then(res => {
                        this.robotChat(`${member.nick}에게 ${leftPrize} 포인트를 지급하였습니다.`)
                    })
                }
            })
        }
        await db.doc(`rooms/${this.state.roomId}`).update({
            questionStatus: 5,
            selectedMember: { docId, uid }
        })
    }
    winnerUnChoice = async () => {
        clearInterval(this.inter)
        const { roomId, myMemberData, members, room } = this.state;
        const allPoint = room.point;
        const prize = Math.floor(allPoint / (members.length - 1));
        members.map( async (member, index) => {
            if(member.docId !== myMemberData.docId){
                await db.doc(`users/${member.docId}`).update({
                    point: member.point + prize
                })
                await this.robotChat(`${member.nick}에게 ${prize} 포인트를 지급하였습니다.`)
            }
        })
        await db.doc(`rooms/${roomId}`).update({
            status: 3,
            questionStatus: 6
        })
        await this.robotChat(`${myMemberData.nick} 님이 아무도 선택하지 않았습니다.`)
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
                    questionStatus: 6
                }).then(res => {
                    this.robotChat(`${this.state.myMemberData.nick} 님이 친구 등록을 거절하였습니다.`)
                })
            }
        }
    }
    friendRegister = async (room) => {
        const masterDodId = room.master.docId;
        const partnerDocId = this.state.room.selectedMember.docId;
        const masterRef = await db.doc(`users/${masterDodId}`).get();
        const partnerRef = await db.doc(`users/${partnerDocId}`).get();
        const master = masterRef.data();
        const partner = partnerRef.data();
        const idxMaster = master.friends.indexOf(partner.uid);
        const idxPartner = partner.friends.indexOf(master.uid);
        if(idxMaster === -1 && idxPartner === -1){
            await db.doc(`users/${masterDodId}`).update({
                friends: [...master.friends, partner.uid ]
            })
            await db.doc(`users/${partnerDocId}`).update({
                friends: [...partner.friends, master.uid ]
            })
            await this.robotChat(`${master.nick} 님과 ${partner.nick} 님이 친구로 등록되었습니다.`)
        }else{
            await this.robotChat(`${master.nick} 님과 ${partner.nick} 님은 원래 친구입니다.`)
        }
        await db.doc(`rooms/${this.state.roomId}`).update({
            status: 3,
            questionStatus: 6
        })
    }
    robotChat = async (msg) => {
        await db.doc(`rooms/${this.state.roomId}`).collection("message").add({
            who: 'n5dCczQosxbCYpnmpZvZCzdy4Xx2',
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
                            <View style={styles.prizeContainer}>
                                <Text style={styles.prizeText}>
                                    {this.state.room.point} 포인트
                                </Text>
                            </View>
                            <Text style={styles.questionTitleText}>
                                {this.state.room.questionList.length}. {kingGameQuestionDB[this.state.room.questionList[0]].title}
                            </Text>
                            {kingGameQuestionDB[this.state.room.questionList[0]].selection.map((item, index) => {
                                return(
                                    <TouchableOpacity key={item+index}>
                                        <Text style={styles.questionSelectionText}>
                                            {index + 1}. {item}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                            {
                                this.state.room.master.uid === this.state.myMemberData.uid ?
                                    this.state.isAnswered ? 
                                        <View>
                                            <Text>
                                                이번 주제에서 가장 맘에 드는 회원은 ? 
                                                ( 선택을 하면 다음 주제로 넘어갑니다.)
                                            </Text>
                                            {this.state.members.map((mem, index) => {
                                                if(mem.uid !== this.state.room.master.uid){
                                                    return(
                                                        <View 
                                                            key={mem.uid} 
                                                        >
                                                            <Text>
                                                                {mem.nick}
                                                            </Text>
                                                        </View> 
                                                    )
                                                }
                                            })}
                                        </View>
                                    :
                                        <View>
                                            <Text>
                                                이번 주제에서 가장 맘에 드는 회원은 ? 
                                                ( 선택을 하면 다음 주제로 넘어갑니다.)
                                            </Text>
                                            {this.state.members.map((mem, index) => {
                                                if(mem.uid !== this.state.room.master.uid){
                                                    return(
                                                        <TouchableOpacity 
                                                            onPress={() => this.setState({isAnswered: true}, () => this.next(mem.nick))}
                                                            key={mem.uid} 
                                                        >
                                                            <Text>
                                                                {mem.nick}
                                                            </Text>
                                                        </TouchableOpacity> 
                                                    )
                                                }
                                            })}
                                        </View>
                                : 
                                    null
                            }
                        </View>
                    :
                        <View style={styles.questionContainer}>
                            <View style={styles.prizeContainer}>
                                <Text style={styles.prizeText}>
                                    {this.state.room.point} 포인트
                                </Text>
                            </View>
                            <Text style={styles.questionTitleText}>
                                {kingGameNoticeDB[this.state.room.questionStatus].title}
                            </Text>
                                {kingGameNoticeDB[this.state.room.questionStatus].selection.map((item, index) => {
                                return(
                                    <View key={item+index}>
                                        <Text style={styles.questionSelectionText}>
                                            {index + 1}. {item}
                                        </Text>
                                    </View>
                                )
                            })}
                            {
                                this.state.room.questionStatus === 1 &&
                                this.state.room.master.uid === this.state.myMemberData.uid ?
                                    this.state.isAnswered ? 
                                        <View 
                                            style={styles.questionButtonContainer}
                                        >
                                            <Text style={styles.questionButtonText}>
                                                시작하기
                                            </Text>
                                        </View>
                                    :
                                        <TouchableOpacity 
                                            style={styles.questionButtonContainer}
                                            onPress={() => this.setState({isAnswered: true}, () => this.start())} 
                                        >
                                            <Text style={styles.questionButtonText}>
                                                시작하기
                                            </Text>
                                        </TouchableOpacity> 
                            : 
                                null
                            }
                            {
                                this.state.room.questionStatus === 3 &&
                                this.state.room.master.uid === this.state.myMemberData.uid ?
                                    this.state.isAnswered ? 
                                        <View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    추가 대화 주제를 받는다 ( 10000 포인트 )
                                                </Text>
                                            </View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    추가 대화 주제를 받는지 않는다
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={{fontSize: 20, textAlign: 'center'}}>
                                                    선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                </Text>
                                            </View>
                                        </View>
                                    :
                                        <View>
                                            <TouchableOpacity onPress={() => this.setState({isAnswered: true}, () => this.plusQuestionSelect(true))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    추가 대화 주제를 받는다 ( 10000 포인트 )
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.setState({isAnswered: true}, () => this.plusQuestionSelect(false))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    추가 대화 주제를 받는지 않는다
                                                </Text>
                                            </TouchableOpacity>
                                            <View>
                                                <Text style={{fontSize: 20, textAlign: 'center'}}>
                                                    선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                </Text>
                                            </View>
                                        </View> 
                            : 
                                null
                            }
                            {
                                this.state.room.questionStatus === 4 &&
                                this.state.room.master.uid === this.state.myMemberData.uid ?
                                    this.state.isAnswered ?
                                        <View>
                                            {this.state.members.map((member, index) => {
                                                if(member.uid !== this.state.myMemberData.uid){
                                                    return(
                                                        <View 
                                                            key={member.uid +  index} 
                                                            style={{margin: 30}}
                                                        >
                                                            <Text style={{
                                                                fontSize: 30, 
                                                                textAlign: 'center',
                                                                color: this.state.selectedNumber === index ? "red" : "black"
                                                            }}>
                                                                {member.nick}
                                                            </Text>
                                                        </View>
                                                    )
                                                }
                                            })}
                                            <View>
                                                <Text style={{fontSize: 20, textAlign: 'center'}}>
                                                    선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                </Text>
                                            </View>
                                        </View>
                                    :
                                        <View>
                                            {this.state.members.map((member, index) => {
                                                if(member.uid !== this.state.myMemberData.uid){
                                                    return(
                                                        <TouchableOpacity 
                                                            key={member.uid +  index} 
                                                            style={{margin: 30}} 
                                                            onPress={() => this.setState({isAnswered: true, selectedNumber: index}, () => this.winnerChoice(member.docId, member.uid))}>
                                                            <Text style={{fontSize: 30, textAlign: 'center'}}>
                                                                {member.nick}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )
                                                }
                                            })}
                                            <View>
                                                <Text style={{fontSize: 20, textAlign: 'center'}}>
                                                    선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                </Text>
                                            </View>
                                        </View>
                                :
                                    null
                            }
                            {
                                this.state.room.questionStatus === 5 &&
                                (
                                    this.state.room.selectedMember.uid === this.state.myMemberData.uid ||
                                    this.state.room.master.uid === this.state.myMemberData.uid
                                )
                            ?
                                    this.state.isAnswered ? 
                                        <View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={[styles.questionButtonText, {color: this.state.selectedNumber === 0? "red" : "#eeeeee"}]}>
                                                    친구로 등록한다
                                                </Text>
                                            </View>
                                            <View style={styles.questionButtonContainer}>
                                                <Text style={[styles.questionButtonText, {color: this.state.selectedNumber === 1 ? "red" : "#eeeeee"}]}>
                                                    친구로 등록하지 않는다.
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={{fontSize: 20, textAlign: 'center'}}>
                                                    선택할수 있는 시간이 {this.state.timer} 초 남았습니다.
                                                </Text>
                                            </View>
                                        </View>
                                    :
                                        <View>
                                            <TouchableOpacity 
                                                onPress={() => this.setState({isAnswered: true, selectedNumber: 0}, () => this.friendPlusAnswer(true))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    친구로 등록한다
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.setState({isAnswered: true, selectedNumber: 1}, () => this.friendPlusAnswer(false))} style={styles.questionButtonContainer}>
                                                <Text style={styles.questionButtonText}>
                                                    친구로 등록하지 않는다.
                                                </Text>
                                            </TouchableOpacity>
                                            <View>
                                                <Text style={{fontSize: 20, textAlign: 'center'}}>
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
    prizeContainer: {
        backgroundColor: 'pink', marginBottom: 10
    },
    prizeText: {
        textAlign: 'center', fontSize: 30
    }
})
export default Room;