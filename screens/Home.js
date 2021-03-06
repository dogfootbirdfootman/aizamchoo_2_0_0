import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Modal, ScrollView, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { roomDB, roomStatusColor, roomStatusText } from '../dbs';
import firebase from 'firebase/app';
import fb from '../fb';
import store from '../store';
import AgeRoomCondition from '../components/AgeRoomCondition';

const db = fb.firestore();
const realdb = fb.database();
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row'
    },
    roomListContainer: {
        flex: 3,
        borderRightWidth: 1,
        borderColor: "#cccccc"
    },
    roomMakeButtonsContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly'
    },
    buttonContainer: {
        paddingHorizontal: 10
    },
    button: {
        backgroundColor: "#faa000",
        borderRadius: 20,
        height: 80,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 18
    },
    modalContainer :{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#90909082"
    },
    modalContentContainer: {
        width: Dimensions.get("window").width / 1.5,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 10
    },
    picker: {
        marginBottom: 20,
    },
    pickerItem: {
        fontSize: 20,
    },
    inModalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    inModalButton: {
        flex:1,
        paddingVertical: 10,
        backgroundColor: '#cccccc',
        margin: 1,
        borderRadius: 10
    },
    inModalButtonText: {
        textAlign: 'center',
        fontSize: 22
    },
    room: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#aaaaaa"
    },
    roomOne: {
        flexDirection: "row",
    },
    roomOneText: {
        fontSize: 20,
        marginRight: 5,
        fontWeight: "bold"
    },
    roomTwo: {
        paddingHorizontal: 10,
        borderRadius: 3
    },
    roomTwoText: {
        fontSize: 20,
        color: "white"
    }
})
const roomDrawerNaviName = ["SogaetingRoomDrawerNavi", "MeetingRoomDrawerNavi", "KingGameRoomDrawerNavi", "PlazaRoomDrawerNavi", "BlindProfileDrawerNavi"]
class Home extends Component {
    state = {
        roomList: [],
        modal: false,
        mainIndex: 0,
        subIndex: 0,
        subNameIndex: 0,
        ageLimit: [20, 50],
        user: store.getState().user,
        loading: false,
        point: '0'
    }
    componentDidMount(){
        ////
        this.registerInRealdb();
        ////
        this.unsubscribe = store.subscribe(this.setUser);
        ////
        this.unSnapshot = db.collection("rooms").onSnapshot((querySnapshot) => {
            const roomList = querySnapshot.docs.map((doc) => {
                const room = {...doc.data(), roomId: doc.id};
                return room
            })
            this.setState({
                roomList
            })
        })
        ////
        this.unsubscribeMyDataUpdate = db.doc(`users/${this.state.user.docId}`).onSnapshot((documentSnapshot) => {
            const user = documentSnapshot.data();
            store.dispatch({ type: 'user', user: {...user, docId: this.state.user.docId}});
        })
    }
    componentWillUnmount(){
        this.unSnapshot()
        this.unsubscribe()
        this.unsubscribeMyDataUpdate();
    }
    registerInRealdb = () => {
        const { user } = this.state;
        const userStatusDatabaseRef = realdb.ref('/status/' + user.uid);
        const isOfflineForDatabase = {
            state: 'offline',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            roomId: "",
            memberId: "",
            docId: user.docId,
            sex: user.sex,
            job: user.job,
            heightCentimeter: Number(user.heightCentimeter.slice(0,3)),
            age: Number(new Date(Date.now()).getFullYear() - user.age.toDate().getFullYear() + 1),
            religion: user.religion,
            earnPerYear: user.earnPerYear,
            family: user.family,
            hobby: user.hobby,
            drink: user.drink,
            smoke: user.smoke,
            character: user.character,
            bodyForm: user.bodyForm,
            style: user.style
        };
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            roomId: "",
            memberId: "",
            docId: user.docId,
            sex: user.sex,
            job: user.job,
            heightCentimeter: Number(user.heightCentimeter.slice(0,3)),
            age: Number(new Date(Date.now()).getFullYear() - user.age.toDate().getFullYear() + 1),
            religion: user.religion,
            earnPerYear: user.earnPerYear,
            family: user.family,
            hobby: user.hobby,
            drink: user.drink,
            smoke: user.smoke,
            character: user.character,
            bodyForm: user.bodyForm,
            style: user.style
        };
        realdb.ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() === false) {
                return;
            };
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });
    }
    setUser = () => {
        const user = store.getState().user;
        if(user.inviteBlind === ''){
            this.setState({
                user
            }, async () => {
                const userStatusDatabaseRef = realdb.ref('/status/' + user.uid);
                const dataSnapshot = await userStatusDatabaseRef.get();
                const data = dataSnapshot.val();
                const isOnlineForDatabase = {
                    ...data,
                    state: 'online',
                    last_changed: firebase.database.ServerValue.TIMESTAMP,
                    heightCentimeter: Number(user.heightCentimeter.slice(0,3)),
                    age: Number(new Date(Date.now()).getFullYear() - user.age.toDate().getFullYear() + 1),
                    religion: user.religion,
                    earnPerYear: user.earnPerYear,
                    family: user.family,
                    hobby: user.hobby,
                    drink: user.drink,
                    smoke: user.smoke,
                    character: user.character,
                    bodyForm: user.bodyForm,
                    style: user.style
                };
                await userStatusDatabaseRef.set(isOnlineForDatabase);
            })
        }else{
            Alert.alert(
                "??????",
                "???????????? ????????? ????????? ????????? ????????????.",
                [
                    {
                        text: "??????",
                        onPress: () => db.doc(`users/${this.state.user.docId}`).update({inviteBlind: ''}),
                        style: "cancel"
                    },
                    { text: "????????????", 
                        onPress: async () => {
                            const roomSnapshot = await db.doc(`rooms/${user.inviteBlind}`).get();
                            if(roomSnapshot.exists){
                                const roomData = roomSnapshot.data();
                                if(roomData.status === 0){
                                    this.joinRoom({...roomData, roomId: user.inviteBlind})
                                }else if(roomData.status === 1){
                                    alert('?????? ?????? ??????????????????.')
                                }else if(roomData.status === 2){
                                    alert('?????? ?????? ??? ????????????.')
                                }else if(roomData.status === 3){
                                    alert('?????? ?????? ?????????????????????.')
                                }
                            }else{
                                alert('?????? ??????????????????.')
                            }
                            await db.doc(`users/${this.state.user.docId}`).update({inviteBlind: ''});
                        }
                    }
                ],
                { cancelable: false }
            );
        }
    }
    onChangeAgeLimit = (ageLimit) => {
        this.setState({
            ageLimit
        })
    }
    onChangePoint = (point) => {
        if(isNaN(Number(point))){
            alert("????????? ???????????????.")
            this.setState({
                point: ''
            })
        }else{
            this.setState({
                point
            })
        }
    }
    buttonAction = (index) => {
        if(index === 100){
            this.setState({
                modal: true,
                loading: false
            })
        }else {
            this.searchRoom(index)
        }
    }
    makeRoom = async () => {
        const { mainIndex, subIndex, subNameIndex, ageLimit, user, point } = this.state;
        const maxPeople = roomDB[mainIndex].kindOf[subIndex].max;
        //////////////////////////////????????? ??????//////////////////////////////////
        // ????????? ??????
        const userRef = await db.doc(`users/${user.docId}`).get();
        const userPoint = userRef.data().point;
        if(userPoint < Number(point)){
            alert("???????????? ???????????????.")
            this.setState({
                loading: false
            })
            return
        }
        // ??? ??????
        const newPoint = userPoint - Number(point);
        await db.doc(`users/${user.docId}`).update({point: newPoint})
        store.dispatch({ type: 'user', user: {...user, point: newPoint}});
        //////////////////////////////????????? ??????//////////////////////////////////
        ////////////////////???????????? ????????? ????????? ?????? ?????? ?????? ////////////////////
        if(mainIndex === 4){
            if( user.earnPerYear === null ||  user.family === null || user.hobby.length === 0 ||
                user.drink === null || user.smoke === null || user.character.length === 0 || user.bodyForm === null || user.style === null ){
                    alert("????????? ?????? ????????? ????????? ???????????? ???????????? ???????????? ????????????.")
                    this.setState({
                        loading: false
                    })
                    return
            }
        }
        ////////////////////???????????? ????????? ????????? ?????? ?????? ?????? ////////////////////
        // ?????? ????????????
        const roomObj = {
            mainIndex,
            subIndex,
            subNameIndex,
            ageLimit,
            maxPeople,
            status: 0,
            master: {...user, point: newPoint},
            man: user.sex === '??????' ? 1 : 0,
            woman: user.sex === '??????' ? 1 : 0,
            questionStatus: 0,
            questionList: [],
            masterAnswer: '',
            guestAnswer: '',
            agree: [],
            disagree: [],
            point: mainIndex === 2 ? Number(point) : 0,
            selectedMember: ''
        }
        const roomRef = await db.collection("rooms").add(roomObj);
        const roomId = roomRef.id;
        this.cancel();
        // ????????? ????????????
        const memberRef = await db.doc(`rooms/${roomId}`).collection("member").add({
            ...{...user, point: newPoint},
            time:  firebase.firestore.FieldValue.serverTimestamp(),
            answer: [],
            choice: ''
        })
        const memberId = memberRef.id;
        const memberSnapshot = await memberRef.get();
        /// Room ???????????? ??????
        const roomParams = { mainIndex, subIndex, roomId, roomData: roomObj, memberId, memberData: memberSnapshot.data()};
        this.props.navigation.navigate(roomDrawerNaviName[mainIndex], roomParams);
        // ???????????? ????????????
        await db.doc(`rooms/${roomId}`).collection("message").add({
            who: "system",
            type: "system",
            content: `${user.nick_open === 0 ? mainIndex === 4 ? "???": user.nick : "???"} ?????? ?????? ?????????????????????.`,
            time:  firebase.firestore.FieldValue.serverTimestamp(),
        })
        await db.doc(`rooms/${roomId}`).collection("message").add({
            who: "system",
            type: "system",
            content: `${user.nick_open === 0 ? mainIndex === 4 ? "???": user.nick : "???"} ?????? ?????????????????????.`,
            time:  firebase.firestore.FieldValue.serverTimestamp(),
        })
        // ????????? ?????? ????????? ????????? ?????? ?????? ?????? ?????? ????????????
        const userStatusDatabaseRef = realdb.ref('/status/' + user.uid);
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            roomId: roomId,
            memberId: memberId,
            docId: user.docId,
            sex: user.sex,
            job: user.job,
            heightCentimeter: Number(user.heightCentimeter.slice(0,3)),
            age: Number(new Date(Date.now()).getFullYear() - user.age.toDate().getFullYear() + 1),
            religion: user.religion,
            earnPerYear: user.earnPerYear,
            family: user.family,
            hobby: user.hobby,
            drink: user.drink,
            smoke: user.smoke,
            character: user.character,
            bodyForm: user.bodyForm,
            style: user.style
        };
        await userStatusDatabaseRef.set(isOnlineForDatabase);
        await db.doc(`users/${user.docId}`).update({roomId, memberId})
        store.dispatch({ type: 'user', user: {...user, roomId, memberId}});
    }
    roomClick = (room) => {
        const { user } = this.state;
        const { roomId, status, mainIndex, maxPeople, man, woman, master } = room;
        if(mainIndex === 4){
            alert("???????????? ???????????? ?????? ????????? ????????? ???????????????.");
            this.setState({
                loading: false
            })
            return;
        }
        else if(status === 1){
            alert("?????????");
            this.setState({
                loading: false
            })
            return;
        }
        else if(status === 2){
            alert("??????");
            this.setState({
                loading: false
            })
            return;
        }else if(status === 3){
            alert("?????????");
            this.setState({
                loading: false
            })
            return;
        }else if((mainIndex === 0 || mainIndex === 2) && (master.sex === user.sex)){
            alert("????????? ????????? ??????");
            this.setState({
                loading: false
            })
            return;
        }else if(mainIndex === 1 && ((user.sex === "??????" && (man >= maxPeople/2))||(user.sex === "??????" && (woman >= maxPeople/2)))){
            alert("?????? ??????");
            this.setState({
                loading: false
            })
            return;
        }else if(mainIndex === 1){
            db.collection("rooms").doc(roomId).collection("member").get()
            .then((querySnapshot) => {
                let ageFalse = 0;
                querySnapshot.docs.map((doc, index) => {
                    const data = doc.data();
                    const memberAge = Number(new Date(Date.now()).getFullYear() - data.age.toDate().getFullYear() + 1)
                    if(user.age_y[0] <= memberAge && user.age_y[1] >= memberAge){
                        
                    }else {
                        ageFalse = ageFalse + 1;
                    }
                })
                if(ageFalse === 0){
                    return this.joinRoom(room);
                }else {
                    Alert.alert(
                        "??????!!",
                        `????????? ???????????? ???????????????(??????)??? ????????? ????????? ${ageFalse} ??? ????????????.`,
                        [
                            {
                                text: "?????????!!",
                                onPress: () => {
                                    this.setState({
                                        loading: false
                                    })
                                    return;
                                },
                                style: "cancel"
                            },
                            { text: "????????? ??????", onPress: () => {
                                return this.joinRoom(room);
                            }}
                        ],
                        { cancelable: false }
                    );
                }
            })
        }else if(mainIndex === 0 || mainIndex === 2){
            const ageBool = 
                user.age_y[0] <= Number(new Date(Date.now()).getFullYear() - room.master.age.toDate().getFullYear() + 1) && 
                user.age_y[1] >= Number(new Date(Date.now()).getFullYear() - room.master.age.toDate().getFullYear() + 1)
            if(ageBool){
                return this.joinRoom(room); 
            }else{
                Alert.alert(
                    "??????!!",
                    `????????? ???????????????(??????)??? ?????? ????????????.`,
                    [
                        {
                            text: "?????????!!",
                            onPress: () => {
                                this.setState({
                                    loading: false
                                })
                                return;
                            },
                            style: "cancel"
                        },
                        { text: "????????? ??????", onPress: () => {
                            return this.joinRoom(room);
                        }}
                    ],
                    { cancelable: false }
                );
            }
        }else {
            return this.joinRoom(room);
        }
    }
    joinRoom = async (room) => {
        const { user } = this.state;
        const { roomId, mainIndex, subIndex, maxPeople, man, woman } = room;

        // ????????? ????????????
        const memberRef = await db.doc(`rooms/${roomId}`).collection("member").add({
            ...user,
            time:  firebase.firestore.FieldValue.serverTimestamp(),
            answer: [],
            choice: ''
        })
        const memberId = memberRef.id;
        const memberSnapshot = await memberRef.get();

        // ??? ???????????? ??????
        const roomParams = { mainIndex, subIndex, roomId, roomData: room, memberId, memberData: memberSnapshot.data()};
        this.props.navigation.navigate(roomDrawerNaviName[mainIndex], roomParams)

        this.cancel()
        // ?????? ???????????? ??????
        const peopleCount = man + woman;
        const countUp = user.sex === "??????" ? {man: man + 1} : {woman: woman + 1};
        const updateData = peopleCount === maxPeople - 1 ?
                {...countUp, status: 2 } 
            : 
                {...countUp }
        ;
        await db.doc(`rooms/${roomId}`).update(updateData);

        // ???????????? ????????????
        await db.doc(`rooms/${roomId}`).collection("message").add({
            who: "system",
            type: "system",
            content: `${user.nick_open === 0 ? mainIndex === 4 ? "???": user.nick : "???"} ?????? ?????????????????????.`,
            time:  firebase.firestore.FieldValue.serverTimestamp()
        })

        // ????????? ?????? ????????? ????????? ?????? ?????? ?????? ?????? ????????????
        const userStatusDatabaseRef = realdb.ref('/status/' + user.uid);
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            roomId: roomId,
            memberId: memberId,
            docId: user.docId,
            sex: user.sex,
            job: user.job,
            heightCentimeter: Number(user.heightCentimeter.slice(0,3)),
            age: Number(new Date(Date.now()).getFullYear() - user.age.toDate().getFullYear() + 1),
            religion: user.religion,
            earnPerYear: user.earnPerYear,
            family: user.family,
            hobby: user.hobby,
            drink: user.drink,
            smoke: user.smoke,
            character: user.character,
            bodyForm: user.bodyForm,
            style: user.style
        };
        await userStatusDatabaseRef.set(isOnlineForDatabase);
        await db.doc(`users/${user.docId}`).update({roomId, memberId});
        store.dispatch({ type: 'user', user: {...user, roomId, memberId}});
    }
    cancel = () => {
        this.setState({
            modal: false,
            mainIndex: 0,
            subIndex: 0,
            subNameIndex: 0,
            ageLimit: [20, 50],
            loading: false,
            point: '0'
        })
    }
    searchRoom = (mainIndex) => {
        const { user, roomList } = this.state;
        const userAge = Number(new Date(Date.now()).getFullYear() - user.age.toDate().getFullYear() + 1);
        const userIdealAge = user.age_y;
        const searchedRoom = [];
        roomList.map((room, index) => {
            const roomMasterAge = Number(new Date(Date.now()).getFullYear() - room.master.age.toDate().getFullYear() + 1);
            const ageLimitBool = room.ageLimit[0] <= userAge && room.ageLimit[1] >= userAge;
            if(mainIndex === 0 || mainIndex === 2){
                const ageIdealBool = userIdealAge[0] <= roomMasterAge && userIdealAge[1] >= roomMasterAge;
                if(ageLimitBool && ageIdealBool && room.status === 0 && mainIndex === room.mainIndex && user.sex !== room.master.sex){
                    searchedRoom.push(room)
                }
            }else if(mainIndex === 1){
                if(ageLimitBool && room.status === 0 && mainIndex === room.mainIndex){
                    if(
                        (user.sex === "??????" && room.man < room.maxPeople / 2) ||
                        (user.sex === "??????" && room.woman < room.maxPeople / 2)
                    ){
                        searchedRoom.push(room)
                    }
                }
            }else if(mainIndex === 3){
                if(ageLimitBool && room.status === 0 && mainIndex === room.mainIndex){
                    searchedRoom.push(room)
                }
            }
        })
        if(searchedRoom.length === 0) {
            alert("????????? ?????? ????????????.");
            this.setState({
                loading: false
            })
        }else {
            this.joinRoom(searchedRoom[Math.floor(Math.random() * searchedRoom.length)])
        }
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.roomListContainer}>
                    <ScrollView>
                    {
                        this.state.roomList.length !== 0 ?
                            this.state.roomList.map((room, index) => {
                                const userAge = Number(new Date(Date.now()).getFullYear() - this.state.user.age.toDate().getFullYear() + 1);
                                if((    room.ageLimit[0] <= userAge && room.ageLimit[1] >= userAge ) || 
                                        room.master.uid === this.state.user.uid)
                                {
                                    if(this.state.loading === true){
                                        return(
                                            <View 
                                                key={room.roomId + index} 
                                                style={styles.room}
                                            >
                                                <View style={styles.roomOne}>
                                                    <Text style={styles.roomOneText}>
                                                        {room.mainIndex === 2 ? roomDB[room.mainIndex].subName[room.subNameIndex] : roomDB[room.mainIndex].name}
                                                        {room.mainIndex === 1 && roomDB[room.mainIndex].kindOf[room.subIndex].alias}
                                                    </Text>
                                                    <Text style={styles.roomOneText}>
                                                        ( 
                                                    </Text>
                                                    {room.mainIndex === 2 &&
                                                        <Text style={styles.roomOneText}>
                                                            {room.point}
                                                        </Text>
                                                    }
                                                    {room.master.sex === "??????" ? 
                                                            <>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    ??? {room.man}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    ??? {room.woman}
                                                                </Text>
                                                            </>
                                                        :
                                                            <>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    ??? {room.woman}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    ??? {room.man}
                                                                </Text>
                                                            </>}
                                                    <Text style={styles.roomOneText}>
                                                        )
                                                    </Text>
                                                </View>
                                                
                                                <View style={[styles.roomTwo, {backgroundColor: roomStatusColor[room.status]}]}>
                                                    <Text style={styles.roomTwoText}>
                                                        {roomStatusText[room.status]}
                                                    </Text>
                                                </View>
                                            </View>
                                        )
                                    }else {
                                        return(
                                            <TouchableOpacity 
                                                key={room.roomId + index} 
                                                onPress={() => this.setState({loading: true}, () => this.roomClick(room))}
                                                style={styles.room}
                                            >
                                                <View style={styles.roomOne}>
                                                    <Text style={styles.roomOneText}>
                                                        {room.mainIndex === 2 ? roomDB[room.mainIndex].subName[room.subNameIndex] : roomDB[room.mainIndex].name}
                                                        {room.mainIndex === 1 && roomDB[room.mainIndex].kindOf[room.subIndex].alias}
                                                    </Text>
                                                    <Text style={styles.roomOneText}>
                                                        ( 
                                                    </Text>
                                                    {room.mainIndex === 2 &&
                                                        <Text style={styles.roomOneText}>
                                                            {room.point}
                                                        </Text>
                                                    }
                                                    {room.master.sex === "??????" ? 
                                                            <>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    ??? {room.man}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    ??? {room.woman}
                                                                </Text>
                                                            </>
                                                        :
                                                            <>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    ??? {room.woman}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    ??? {room.man}
                                                                </Text>
                                                            </>}
                                                    <Text style={styles.roomOneText}>
                                                        )
                                                    </Text>
                                                </View>
                                                
                                                <View style={[styles.roomTwo, {backgroundColor: roomStatusColor[room.status]}]}>
                                                    <Text style={styles.roomTwoText}>
                                                        {roomStatusText[room.status]}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    }
                                }else {
                                    return(
                                        <View 
                                            key={room.roomId + index} 
                                            style={styles.room}
                                        >
                                            <View style={styles.roomOne}>
                                                <Text style={styles.roomOneText}>
                                                    {roomDB[room.mainIndex].name}
                                                    {room.mainIndex === 1 && roomDB[room.mainIndex].kindOf[room.subIndex].alias}
                                                </Text>
                                                <Text style={styles.roomOneText}>
                                                    ( 
                                                </Text>
                                                {room.master.sex === "??????" ? 
                                                        <>
                                                            <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                ??? {room.man}
                                                            </Text>
                                                            <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                ??? {room.woman}
                                                            </Text>
                                                        </>
                                                    :
                                                        <>
                                                            <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                ??? {room.woman}
                                                            </Text>
                                                            <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                ??? {room.man}
                                                            </Text>
                                                        </>}
                                                <Text style={styles.roomOneText}>
                                                    )
                                                </Text>
                                            </View>
                                            
                                            <View style={[styles.roomTwo, {backgroundColor: "red"}]}>
                                                <Text style={styles.roomTwoText}>
                                                    ????????????
                                                </Text>
                                            </View>
                                        </View>
                                    )
                                }
                                
                            })
                    :
                        null
                    }
                    </ScrollView>
                </View>
                <View style={styles.roomMakeButtonsContainer}>
                    {roomDB.map((item, index) => {
                        if(index !== 4){
                            return(
                                <View key={item.name + index} style={styles.buttonContainer}>
                                    {this.state.loading ? 
                                        <View style={styles.button}>
                                            <Text style={styles.buttonText}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.buttonText}>
                                                ????????????
                                            </Text>
                                        </View>
                                    : 
                                        <TouchableOpacity style={styles.button} onPress={() => this.setState({loading:true}, () => this.buttonAction(index))}>
                                            <Text style={styles.buttonText}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.buttonText}>
                                                ????????????
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            )
                        }
                    })}
                    <View style={styles.buttonContainer}>
                        {this.state.loading ? 
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>
                                    ???
                                </Text>
                                <Text style={styles.buttonText}>
                                    ?????????
                                </Text>
                            </View>
                        :
                            <TouchableOpacity style={styles.button} onPress={() => this.setState({loading:true}, () => this.buttonAction(100))}>
                                <Text style={styles.buttonText}>
                                    ???
                                </Text>
                                <Text style={styles.buttonText}>
                                    ?????????
                                </Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modal}
                    onRequestClose={() => this.setState({modal: false})}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContentContainer}>
                            <Picker 
                                style={styles.picker}
                                dropdownIconColor="gray"
                                selectedValue={this.state.mainIndex}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({
                                        mainIndex: itemValue,
                                        subIndex: 0
                                    });
                                }}
                            >
                                {roomDB.map((item, index) => {
                                    return(
                                        <Picker.Item 
                                            label={item.name}
                                            value={index}
                                            key={item.name+index}
                                            style={styles.pickerItem}
                                        />
                                    )
                                })}
                            </Picker>
                            <Picker 
                                style={styles.picker}
                                dropdownIconColor="gray"
                                selectedValue={this.state.subIndex}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({subIndex: itemValue});
                                }}
                                enabled={(this.state.mainIndex === 0 || this.state.mainIndex === 4) ? false : true }
                            >
                                {roomDB[this.state.mainIndex].kindOf.map((item, index) => {
                                    return(
                                        <Picker.Item 
                                            label={item.alias}
                                            value={index}
                                            key={item.alias+index}
                                            style={styles.pickerItem}
                                        />
                                    )
                                })}
                            </Picker>
                            {
                                this.state.mainIndex === 2 ?
                                    <View style={{padding:5}}>
                                        <Text style={{fontSize: 20}}>
                                            ?????? ????????? (????????? ??????)
                                        </Text>
                                        <TextInput
                                            style={{fontSize: 20, backgroundColor: '#dddddd', padding:10}}
                                            onChangeText={point => this.onChangePoint(point)}
                                            value={this.state.point}
                                            autoCompleteType="off"
                                            autoCorrect={false}
                                            maxLength={30}
                                            textAlign="left"
                                            keyboardType="number-pad"
                                        />
                                    </View>    
                                :
                                    null
                            }
                            {
                                this.state.mainIndex === 2 ?
                                    <Picker 
                                        style={styles.picker}
                                        dropdownIconColor="gray"
                                        selectedValue={this.state.subNameIndex}
                                        onValueChange={(itemValue, itemIndex) => {
                                            this.setState({subNameIndex: itemValue});
                                        }}
                                    >
                                        {roomDB[this.state.mainIndex].subName.map((item, index) => {
                                            return(
                                                <Picker.Item 
                                                    label={item}
                                                    value={index}
                                                    key={item+index}
                                                    style={styles.pickerItem}
                                                />
                                            )
                                        })}
                                    </Picker>    
                                :
                                    null
                            }
                            {this.state.mainIndex === 4 || <AgeRoomCondition onChangeAgeLimit={this.onChangeAgeLimit}/>}
                                {this.state.loading ? 
                                    <View style={styles.inModalButtonsContainer}>
                                        <View style={styles.inModalButton}>
                                            <Text style={styles.inModalButtonText}>
                                                ??? ?????????...
                                            </Text>
                                        </View>
                                        <View style={styles.inModalButton}>
                                            <Text style={styles.inModalButtonText}>
                                                ??????
                                            </Text>
                                        </View>
                                    </View>
                                : 
                                    <View style={styles.inModalButtonsContainer}>
                                        <TouchableOpacity onPress={
                                            () => this.setState({loading:true}, () => this.makeRoom())} 
                                            style={styles.inModalButton}>
                                            <Text style={styles.inModalButtonText}>
                                                ??? ?????????
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.cancel} style={styles.inModalButton}>
                                            <Text style={styles.inModalButtonText}>
                                                ??????
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

export default Home;