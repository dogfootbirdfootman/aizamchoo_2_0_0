import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import fb from '../fb';
import firebase from 'firebase/app';
import Logo from '../assets/logo.png';
import store from '../store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { blindProfileNoticeDB } from '../dbs';
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
                            ???
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
function buttonDraw(text, action = null, isAnswered = false, id = null, selectedNumber = -1){
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
const db = fb.firestore();
const realdb = fb.database();
const list = [
    {
        key: "job",
        text: "?????????",
    },
    {
        key: "school",
        text: "?????????",
    },
    {
        key: "age",
        text: "?????????",
    },
    {
        key: "address",
        text: "????????????",
    },
    {
        key: "heightCentimeter",
        text: "??????",
    },
    {
        key: "religion",
        text: "?????????",
    },
    {
        key: "earnPerYear",
        text: "?????????",
    },
    {
        key: "family",
        text: "???????????????",
    },
    {
        key: "hobby",
        text: "?????????",
    },
    {
        key: "drink",
        text: "?????????",
    },
    {
        key: "smoke",
        text: "?????????",
    },
    {
        key: "character",
        text: "?????????",
    },
    {
        key: "bodyForm",
        text: "?????????",
    },
    {
        key: "style",
        text: "????????????",
    }
]
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#67abff',
        paddingTop: 5
    }
})
class BlindProfile extends Component {
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
            selectedNumber: -1,
            step: 0,
            score: 0
        }
        this.scrollRef = React.createRef()
    }
    componentDidMount(){
        const { roomId, memberId } = this.state;
        // myMemberData ??????
        this.unsubscribeMyMemberDataUpdate = db.doc(`rooms/${roomId}/member/${memberId}`).onSnapshot((documentSnapshot) => {
            if(documentSnapshot.exists){
                this.setState({myMemberData: documentSnapshot.data()})
            }
        })
        // room ( ??? ??? ) ?????? 
        this.unsubscribeRoomDataUpdate = db.doc(`rooms/${roomId}`).onSnapshot((documentSnapshot) => {
            const room = documentSnapshot.data();
            this.setState({room}, () => this.blindStatusControl(room));
        })
        // ??? ?????? message ??????
        this.unsubscribeMessageUpdate = db.doc(`rooms/${roomId}`).collection("message").orderBy("time").onSnapshot((querySnapshot) => {
            const message = querySnapshot.docs.map((doc, index) => {
                return doc.data()
            })
            this.setState({message})
        })
        // ?????? ?????? ????????? ????????? ??????
        this.unsubscribeNavigation = this.props.navigation.addListener("beforeRemove", () => {
            this.roomOut()
        })
        // ????????? ????????? ????????? ??????
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
    robotChat = async (msg) => {
        await db.doc(`rooms/${this.state.roomId}`).collection("message").add({
            who: 'n5dCczQosxbCYpnmpZvZCzdy4Xx2',
            content: msg,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            type: "bot",
            profilePhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/naturalmeeting-2e64a.appspot.com/o/n5dCczQosxbCYpnmpZvZCzdy4Xx2%2FprofilePhoto.png?alt=media&token=76868e33-c956-460c-8d58-999333b35b05',
            nick: `Ai ?????????`
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
            const sexCount = myMemberData.sex === "??????" ? { man: room.man - 1 } : { woman: room.woman - 1 };
            let newStatus = room.status;
            if(room.status === 0){
                if(room.master.uid === myMemberData.uid){
                    newStatus = 3;
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
                    newStatus = 3;
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
            await db.doc(`rooms/${roomId}`).update({status: newStatus, ...sexCount });
            await db.doc(`rooms/${roomId}`).collection("message").add({
                who: "system",
                type: "system",
                content: `${myMemberData.nick_open === 0 ? myMemberData.nick : "?"} ?????? ?????????????????????.`,
                time:  firebase.firestore.FieldValue.serverTimestamp()
            })
        }
        // ????????? ?????? ????????? ????????? ?????? ?????? ?????? ?????? ????????????
        const storeUser = store.getState().user;
        const userStatusDatabaseRef = realdb.ref('/status/' + storeUser.uid);
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            roomId: "",
            memberId: "",
            sex: storeUser.sex,
            job: storeUser.job,
            docId: storeUser.docId,
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
    searchIdeal = (user, roomId) => {
        realdb.ref('status').get().then((dataSnapshot) => {
            const AllUserList = [];
            const indexes = [];
            let count = 0;
            dataSnapshot.forEach(function(childSnapshot){
                const childData = childSnapshot.val();
                if(
                    childSnapshot.key !== user.id && //?????? ????????????
                    childData.state === 'online' &&  // ???????????? ????????????
                    childData.roomId === "" && // ???????????? ????????????
                    childData.sex !== user.sex && // ????????? ?????? ??????
                    (user.job_y.indexOf(childData.job) !== -1 || user.job_y.length === 0) && // ????????? ??????
                    (user.height_y[0] <= childData.heightCentimeter && childData.heightCentimeter <= user.height_y[1]) && // ????????? ???
                    (user.age_y[0] <= childData.age && childData.age <= user.age_y[1]) && // ????????? ??????
                    (user.religion_y.indexOf(childData.religion) !== -1 || user.religion_y.length === 0) &&
                    //????????? ?????? 

                    // ???????????? ?????? ??????????????? ??????
                    childData.earnPerYear !== undefined &&
                    childData.family !== undefined &&
                    childData.hobby !== undefined &&
                    childData.drink !== undefined &&
                    childData.smoke !== undefined &&
                    childData.character !== undefined &&
                    childData.bodyForm !== undefined &&
                    childData.style !== undefined
                    ){
                        AllUserList.push(childData.docId)
                }
            })
            while(count < 3 && count < AllUserList.length){
                const idx = Math.floor(Math.random() * AllUserList.length);
                if(indexes.indexOf(idx) === -1){
                    indexes.push(idx)
                    count ++;
                    db.doc(`users/${AllUserList[idx]}`).update({
                        inviteBlind: roomId
                    })
                }
            }
            if(count === 0){
                this.robotChat(`????????? ?????? ???????????????.`)
            }else{
                this.robotChat(`${count} ??? ?????? ???????????? ???????????????.`)
            }
        })
    }
    blindStatusControl = (room) => {
        if(room.status === 3 && room.questionStatus !== 3){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 3
            })
            return;
        }
        else if(room.status === 0 && room.questionStatus === 1 && room.master.uid === this.state.myMemberData.uid){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 0
            })
            return;
        }
        else if(room.status === 2 && room.master.uid === this.state.myMemberData.uid){
            db.doc(`rooms/${this.state.roomId}`).update({
                questionStatus: 1
            })
            return;
        }
        else if(
            room.status === 1 && 
            room.questionStatus === 2 && 
            this.state.step >= 0 && this.state.step < list.length &&
            room.masterAnswer === '' && room.guestAnswer === ''
            ){
            this.blindProfileStep(this.state.step)
            return;
        }
        else if(
            room.status === 1 && 
            room.questionStatus === 2 && 
            this.state.step === list.length &&
            room.masterAnswer === '' && room.guestAnswer === ''
            ){
            this.result(this.state.score)
            return;
        }
        else if(
            room.status === 1 && 
            room.questionStatus === 2 && 
            this.state.step >= 0 && this.state.step < list.length &&
            room.masterAnswer !== '' && room.guestAnswer !== ''
            ){
            this.setState((prevState) => {
                return({
                    step: prevState.step + 1,
                })
            }, () => {
                if(room.master.uid === this.state.myMemberData.uid){
                    db.doc(`rooms/${this.state.roomId}`).update({
                        masterAnswer: '',
                        guestAnswer: ''
                    })
                }
            })
        }
        else if(
            room.status === 1 && 
            room.questionStatus === 2 && 
            this.state.step === list.length &&
            room.masterAnswer !== '' && room.guestAnswer !== ''
            ){
                if(room.masterAnswer === 'agree' && room.guestAnswer === 'agree'){
                    this.friendRegister()
                }
                if(room.master.uid === this.state.myMemberData.uid){
                    db.doc(`rooms/${this.state.roomId}`).update({
                        status: 3,
                        questionStatus: 3
                    })
                }
        }
    }
    start = () => {
        this.setState({isAnswered: true}, () => {
            db.doc(`rooms/${this.state.roomId}`).update({
                status: 1,
                questionStatus: 2
            }).then(res => this.setState({isAnswered: false}))
        })
    }
    answer = (score, selectedNumber) => {
        this.setState((prevState) => {
            return({
                    isAnswered: true,
                    score: prevState.score + score,
                    selectedNumber: selectedNumber
                })
        }, () => {
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
        })
    }
    blindProfileStep = async (step) => {
        const { myMemberData } = this.state;
        let data = "";
        if(step === 2){
            data = Number(new Date(Date.now()).getFullYear() - myMemberData[list[step].key].toDate().getFullYear() + 1)
        }else if(step === 3){
            data =  myMemberData[list[step].key+"_0"] + " " + myMemberData[list[step].key + "_1"]
        }else if(step === 7){
            data =  myMemberData[list[step].key][0] + " ??? " + myMemberData[list[step].key][1] + " ??? ??? " + myMemberData[list[step].key][2] + " ???"
        }else if(step === 8 || step === 11){
            myMemberData[list[step].key].map((hobby, index) => {
                data = data + hobby + " "
            })
        }else{
            data = myMemberData[list[step].key]
        }
        await this.robotChat(`${step + 1}. ${myMemberData.sex}??? ${list[step].text} ${data} ?????????.`)
        if(step > 0){
            this.setState({
                isAnswered: false,
                selectedNumber: -1
            })
        }
    }
    result = (score) => {
        const { myMemberData, room, roomId } = this.state;
        let yourSex;
        if(myMemberData.sex === "??????"){
            yourSex = "??????"
        }else{
            yourSex = "??????"
        }
        this.robotChat(`${yourSex}??? ?????? ????????? ${score} ??? ?????????.`)
        if(score > 9){
            if(room.master.uid === myMemberData.uid){
                db.doc(`rooms/${roomId}`).update({
                    masterAnswer: 'agree'
                })
            }else{
                db.doc(`rooms/${roomId}`).update({
                    guestAnswer:'agree'
                })
            }
        }else {
            if(room.master.uid === myMemberData.uid){
                db.doc(`rooms/${roomId}`).update({
                    masterAnswer: 'disagree'
                })
            }else{
                db.doc(`rooms/${roomId}`).update({
                    guestAnswer:'disagree'
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
                    content: `${doc.data().nick}?????? ????????? ???????????????!`,
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
                    content: `${doc.data().nick}?????? ?????? ????????????!!`,
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
    }
    render(){
        return(
            <View style={styles.container}>
                <ScrollView 
                    ref={this.scrollRef} 
                    onContentSizeChange={this.toBottom}
                    stickyHeaderIndices={[0]} 
                >
                {
                    <>
                        {stickyDraw(blindProfileNoticeDB, this.state.room.questionStatus)}
                        {
                            (this.state.room.questionStatus === 0 && this.state.myMemberData.uid === this.state.room.master.uid ) &&
                            buttonDraw("????????? ??????", () => this.searchIdeal(this.state.myMemberData, this.state.roomId))
                        }
                        {
                            (this.state.room.questionStatus === 1 && this.state.myMemberData.uid === this.state.room.master.uid ) &&
                            buttonDraw("???????????? ????????? ??????", this.start, this.state.isAnswered)
                        }
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
                {
                    (this.state.room.questionStatus === 2 && this.state.step < 14) &&
                    <View style={{flexDirection: 'row', justifyContent:'space-evenly'}}>
                        {buttonDraw("?????????", () => this.answer(1, 0), this.state.isAnswered, 0, this.state.selectedNumber)}
                        {buttonDraw("???????????????", () => this.answer(0, 1), this.state.isAnswered, 1, this.state.selectedNumber)}
                        {buttonDraw("????????????", () => this.answer(-1, 2), this.state.isAnswered, 2, this.state.selectedNumber)}
                    </View>
                }
                {textInputDraw(this.state.textInput, this.onChangeTextInput, this.sendMessage)}
            </View>
        )
    }
}

export default BlindProfile;