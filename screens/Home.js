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
                "쪽지",
                "블라인드 프로필 방에서 초대가 왔습니다.",
                [
                    {
                        text: "거절",
                        onPress: () => db.doc(`users/${this.state.user.docId}`).update({inviteBlind: ''}),
                        style: "cancel"
                    },
                    { text: "방에참가", 
                        onPress: async () => {
                            const roomSnapshot = await db.doc(`rooms/${user.inviteBlind}`).get();
                            if(roomSnapshot.exists){
                                const roomData = roomSnapshot.data();
                                if(roomData.status === 0){
                                    this.joinRoom({...roomData, roomId: user.inviteBlind})
                                }else if(roomData.status === 1){
                                    alert('방이 이미 진행중입니다.')
                                }else if(roomData.status === 2){
                                    alert('방이 이미 꽉 찼습니다.')
                                }else if(roomData.status === 3){
                                    alert('방이 이미 종료되었습니다.')
                                }
                            }else{
                                alert('방이 사라졌습니다.')
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
            alert("숫자만 입력하세요.")
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
        //////////////////////////////포인트 차감//////////////////////////////////
        // 가진돈 체크
        const userRef = await db.doc(`users/${user.docId}`).get();
        const userPoint = userRef.data().point;
        if(userPoint < Number(point)){
            alert("포인트가 부족합니다.")
            this.setState({
                loading: false
            })
            return
        }
        // 돈 차감
        const newPoint = userPoint - Number(point);
        await db.doc(`users/${user.docId}`).update({point: newPoint})
        store.dispatch({ type: 'user', user: {...user, point: newPoint}});
        //////////////////////////////포인트 차감//////////////////////////////////
        ////////////////////블라인드 프로필 개설시 공개 여부 확인 ////////////////////
        if(mainIndex === 4){
            if( user.earnPerYear === null ||  user.family === null || user.hobby.length === 0 ||
                user.drink === null || user.smoke === null || user.character.length === 0 || user.bodyForm === null || user.style === null ){
                    alert("미입력 나의 정보가 있으면 블라인드 프로필을 개설할수 없습니다.")
                    this.setState({
                        loading: false
                    })
                    return
            }
        }
        ////////////////////블라인드 프로필 개설시 공개 여부 확인 ////////////////////
        // 방을 개설한다
        const roomObj = {
            mainIndex,
            subIndex,
            subNameIndex,
            ageLimit,
            maxPeople,
            status: 0,
            master: {...user, point: newPoint},
            man: user.sex === '남성' ? 1 : 0,
            woman: user.sex === '여성' ? 1 : 0,
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
        // 멤버를 등록한다
        const memberRef = await db.doc(`rooms/${roomId}`).collection("member").add({
            ...{...user, point: newPoint},
            time:  firebase.firestore.FieldValue.serverTimestamp(),
            answer: [],
            choice: ''
        })
        const memberId = memberRef.id;
        const memberSnapshot = await memberRef.get();
        /// Room 화면으로 이동
        const roomParams = { mainIndex, subIndex, roomId, roomData: roomObj, memberId, memberData: memberSnapshot.data()};
        this.props.navigation.navigate(roomDrawerNaviName[mainIndex], roomParams);
        // 메세지를 입력한다
        await db.doc(`rooms/${roomId}`).collection("message").add({
            who: "system",
            type: "system",
            content: `${user.nick_open === 0 ? mainIndex === 4 ? "???": user.nick : "???"} 님이 방을 개설하였습니다.`,
            time:  firebase.firestore.FieldValue.serverTimestamp(),
        })
        await db.doc(`rooms/${roomId}`).collection("message").add({
            who: "system",
            type: "system",
            content: `${user.nick_open === 0 ? mainIndex === 4 ? "???": user.nick : "???"} 님이 입장하였습니다.`,
            time:  firebase.firestore.FieldValue.serverTimestamp(),
        })
        // 비정상 접속 종료시 처리를 위한 유저 위치 정보 업데이트
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
            alert("블라인드 프로필은 초대 받아야 입장이 가능합니다.");
            this.setState({
                loading: false
            })
            return;
        }
        else if(status === 1){
            alert("진행중");
            this.setState({
                loading: false
            })
            return;
        }
        else if(status === 2){
            alert("풀방");
            this.setState({
                loading: false
            })
            return;
        }else if(status === 3){
            alert("종료됨");
            this.setState({
                loading: false
            })
            return;
        }else if((mainIndex === 0 || mainIndex === 2) && (master.sex === user.sex)){
            alert("방장과 성별이 같음");
            this.setState({
                loading: false
            })
            return;
        }else if(mainIndex === 1 && ((user.sex === "남성" && (man >= maxPeople/2))||(user.sex === "여성" && (woman >= maxPeople/2)))){
            alert("성별 초과");
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
                        "경고!!",
                        `참가자 이성중에 나의이상형(나이)과 안맞는 사람이 ${ageFalse} 명 있습니다.`,
                        [
                            {
                                text: "돔황챠!!",
                                onPress: () => {
                                    this.setState({
                                        loading: false
                                    })
                                    return;
                                },
                                style: "cancel"
                            },
                            { text: "그래도 입장", onPress: () => {
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
                    "경고!!",
                    `방장이 나의이상형(나이)과 맞지 않습니다.`,
                    [
                        {
                            text: "돔황챠!!",
                            onPress: () => {
                                this.setState({
                                    loading: false
                                })
                                return;
                            },
                            style: "cancel"
                        },
                        { text: "그래도 입장", onPress: () => {
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

        // 멤버를 추가한다
        const memberRef = await db.doc(`rooms/${roomId}`).collection("member").add({
            ...user,
            time:  firebase.firestore.FieldValue.serverTimestamp(),
            answer: [],
            choice: ''
        })
        const memberId = memberRef.id;
        const memberSnapshot = await memberRef.get();

        // 룸 화면으로 이동
        const roomParams = { mainIndex, subIndex, roomId, roomData: room, memberId, memberData: memberSnapshot.data()};
        this.props.navigation.navigate(roomDrawerNaviName[mainIndex], roomParams)

        this.cancel()
        // 방을 업데이트 한다
        const peopleCount = man + woman;
        const countUp = user.sex === "남성" ? {man: man + 1} : {woman: woman + 1};
        const updateData = peopleCount === maxPeople - 1 ?
                {...countUp, status: 2 } 
            : 
                {...countUp }
        ;
        await db.doc(`rooms/${roomId}`).update(updateData);

        // 메세지를 추가한다
        await db.doc(`rooms/${roomId}`).collection("message").add({
            who: "system",
            type: "system",
            content: `${user.nick_open === 0 ? mainIndex === 4 ? "???": user.nick : "???"} 님이 입장하였습니다.`,
            time:  firebase.firestore.FieldValue.serverTimestamp()
        })

        // 비정상 접속 종료시 처리를 위한 유저 위치 정보 업데이트
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
                        (user.sex === "남성" && room.man < room.maxPeople / 2) ||
                        (user.sex === "여성" && room.woman < room.maxPeople / 2)
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
            alert("적합한 방이 없습니다.");
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
                                                    {room.master.sex === "남성" ? 
                                                            <>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    남 {room.man}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    여 {room.woman}
                                                                </Text>
                                                            </>
                                                        :
                                                            <>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    여 {room.woman}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    남 {room.man}
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
                                                    {room.master.sex === "남성" ? 
                                                            <>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    남 {room.man}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    여 {room.woman}
                                                                </Text>
                                                            </>
                                                        :
                                                            <>
                                                                <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                    여 {room.woman}
                                                                </Text>
                                                                <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                    남 {room.man}
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
                                                {room.master.sex === "남성" ? 
                                                        <>
                                                            <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                남 {room.man}
                                                            </Text>
                                                            <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                여 {room.woman}
                                                            </Text>
                                                        </>
                                                    :
                                                        <>
                                                            <Text style={{fontSize: 20, color: "red", marginRight: 5 }}>
                                                                여 {room.woman}
                                                            </Text>
                                                            <Text style={{fontSize: 20, color: "blue", marginRight: 5}}>
                                                                남 {room.man}
                                                            </Text>
                                                        </>}
                                                <Text style={styles.roomOneText}>
                                                    )
                                                </Text>
                                            </View>
                                            
                                            <View style={[styles.roomTwo, {backgroundColor: "red"}]}>
                                                <Text style={styles.roomTwoText}>
                                                    입장불가
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
                                                자동신청
                                            </Text>
                                        </View>
                                    : 
                                        <TouchableOpacity style={styles.button} onPress={() => this.setState({loading:true}, () => this.buttonAction(index))}>
                                            <Text style={styles.buttonText}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.buttonText}>
                                                자동신청
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
                                    방
                                </Text>
                                <Text style={styles.buttonText}>
                                    만들기
                                </Text>
                            </View>
                        :
                            <TouchableOpacity style={styles.button} onPress={() => this.setState({loading:true}, () => this.buttonAction(100))}>
                                <Text style={styles.buttonText}>
                                    방
                                </Text>
                                <Text style={styles.buttonText}>
                                    만들기
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
                                            상금 포인트 (숫자만 입력)
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
                                                방 생성중...
                                            </Text>
                                        </View>
                                        <View style={styles.inModalButton}>
                                            <Text style={styles.inModalButtonText}>
                                                취소
                                            </Text>
                                        </View>
                                    </View>
                                : 
                                    <View style={styles.inModalButtonsContainer}>
                                        <TouchableOpacity onPress={
                                            () => this.setState({loading:true}, () => this.makeRoom())} 
                                            style={styles.inModalButton}>
                                            <Text style={styles.inModalButtonText}>
                                                방 만들기
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.cancel} style={styles.inModalButton}>
                                            <Text style={styles.inModalButtonText}>
                                                취소
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