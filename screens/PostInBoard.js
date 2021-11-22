import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, Keyboard, TextInput, Modal, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
import { memberGradeAlias } from '../dbs';
import { FontAwesome5 } from '@expo/vector-icons';
import fb from '../fb';
import store from '../store';
import firebase from 'firebase/app';
import Logo from '../assets/logo.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const db = fb.firestore();

const changeDateFormat = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if(hours > 12){
        hours = `오후 ${hours - 12}`;
    }else {
        hours = `오전 ${hours}`;
    }
    if(minutes < 10){
        minutes = `0${minutes}`;
    }
    return `${date.getMonth() + 1} 월 ${date.getDate()} 일 ${hours}:${minutes}`
}

class PostInBoard extends Component {
    constructor(props){
        super(props);
        this.state = {
            text: '',
            good: null,
            goodCount: null,
            replys: [],
            replyUpdateModal: false,
            replyText: '',
            updateReplyDocId: '',
            popupModal: false,
            post: this.props.route.params.post
        }
        this.textInputRef = React.createRef()
    }
    
    onChangeText = (text) => {
        this.setState({
            text
        })
    }
    onChangeReplyText = (replyText) => {
        this.setState({
            replyText
        })
    }
    good = () => {
        if(!this.state.good){
            db.collection(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/good`).add({
                uid: store.getState().user.uid
            })
            db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}`).update({
                updateTime: firebase.firestore.FieldValue.serverTimestamp()
            })
        }
    }
    unGood = () => {
        if(this.state.good){
            db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/good/${this.state.good}`).delete();
        }
        db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}`).update({
            updateTime: firebase.firestore.FieldValue.serverTimestamp()
        })
    }
    replyWrite = () => {
        if(this.state.text !== ''){
            db.collection(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/reply`).add({
                uid: store.getState().user.uid,
                comment: this.state.text,
                time: firebase.firestore.FieldValue.serverTimestamp()
            }).then((res) => {this.setState({text: ''});Keyboard.dismiss();})
            db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}`).update({
                replyUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            })
        }
    }
    updateReply = (docId, comment) => {
        if(comment === ''){
            alert("내용이 없습니다.")
        }else{
            if(docId === ''){
                alert("알수없는 오류")
            }else {
                db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/reply/${docId}`).update({comment}).then((res) => this.setState({
                    replyUpdateModal: false,
                    replyText: '',
                    updateReplyDocId: ''
                }))
            }
        }
    }
    replyDelete = (docId) => {
        Alert.alert(
            "댓글 삭제",
            `정말 댓글을 삭제 하시겠습니까?`,
            [
                {
                    text: "취소",
                    onPress: () => {
                        return;
                    },
                    style: "cancel"
                },
                { text: "삭제", onPress: () => {
                    db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/reply/${docId}`).delete().then((res) => {
                        db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}`).update({
                            replyUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
                        })
                    })
                }}
            ],
            { cancelable: false }
        );
    }
    componentDidMount(){
        this.props.navigation.setOptions({
            headerRight: () => {
                if(this.props.route.params.post.writerUid === store.getState().user.uid){
                    return(
                        <TouchableWithoutFeedback onPress={() => this.setState({popupModal: true})}>
                            <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
                        </TouchableWithoutFeedback>
                    )
                }
            }
        })
        this.unsubGood = db.collection(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/good`).where('uid', '==', store.getState().user.uid).onSnapshot((snapshot) => {
            if(snapshot.empty){
                this.setState({good: false})
            }else {
                this.setState({good: snapshot.docs[0].id})
            }
        })
        this.unsubGoodCount = db.collection(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/good`).onSnapshot((snapshot) => {
            if(snapshot.empty){
                this.setState({goodCount: 0})
            }else {
                this.setState({goodCount: snapshot.docs.length})
            }
        })
        this.unsubReply = db.collection(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}/reply`).orderBy("time").onSnapshot( async (snapshot) => {
            if(!snapshot.empty){
                const replys = [];
                const promises = snapshot.docs.map(async(doc, index) => {
                    const data = doc.data();

                    const usersnapshot = await db.collection(`users`).where("uid", "==", data.uid).get();
                    const userData = usersnapshot.docs[0].data();
                    const membersnapshot = await db.collection(`somoim/${this.state.post.somoimDocId}/members`).where("uid", "==", data.uid).get();
                    const memberData = membersnapshot.docs[0].data();
                    replys.push({...data, profilePhotoUrl: userData.profilePhotoUrl, nick: userData.nick, grade: memberData.grade, replyDocId: doc.id})

                })
                await Promise.all(promises);
                this.setState({replys})
            }else {
                this.setState({replys: []})
            }
            this.unsunPost = db.doc(`somoim/${this.state.post.somoimDocId}/board/${this.state.post.postDocId}`).onSnapshot((snapshot) => {
                console.log('업데이트')
                this.setState((prevState) => {
                    return(
                        {post: {...snapshot.data(), somoimDocId: prevState.post.somoimDocId, postDocId: prevState.post.postDocId, profilePhotoUrl: prevState.post.profilePhotoUrl}}
                    )
                })
            })
        })
    }
    componentWillUnmount(){
        this.unsubGood();
        this.unsubGoodCount();
        this.unsubReply();
        this.unsunPost();
    }
    render(){
        return(
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.top}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Image source={this.state.post.profilePhotoUrl ? {uri: this.state.post.profilePhotoUrl}:Logo} style={styles.profilePhoto}/>
                            <View style={styles.nickAndGradeAndTime}>
                                <View style={styles.nickAndGrade}>
                                    <Text style={styles.nickText}>
                                        {this.state.post.nick}
                                    </Text>
                                    <Text style={styles.gradeText}>
                                        {memberGradeAlias[this.state.post.grade]}
                                    </Text>
                                </View>
                                <Text style={styles.timeText}>
                                    {changeDateFormat(this.state.post.time.toDate())}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={styles.categoryText}>
                                {this.state.post.category}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.contents}>
                        <Text style={styles.titleText}>
                            {this.state.post.title}
                        </Text>
                        <Text style={styles.contentText}>
                            {this.state.post.content}
                        </Text>
                        <View>
                            {this.state.post.photoUris.map((photoUri, index) => {
                                if(photoUri !== null){
                                    return(
                                        <Image 
                                            source={{uri: photoUri}} 
                                            style={styles.contentImages} 
                                            key={photoUri}/>
                                    )
                                }
                            })}
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.goodAndReply}>
                            {this.state.good === null ? 
                                <View style={styles.good}>
                                    <FontAwesome5 name="thumbs-up" size={20} color="black" />
                                    <Text style={styles.goodText}>
                                        좋아요
                                    </Text>
                                </View>
                            :
                                this.state.good ? 
                                    <View style={styles.good}>
                                        <FontAwesome5 name="thumbs-up" size={20} color='#81d4fa' />
                                        <TouchableWithoutFeedback onPress={this.unGood}>
                                            <Text style={[styles.goodText, {color: '#81d4fa'}]}>
                                                좋아요
                                            </Text>
                                        </TouchableWithoutFeedback>
                                        
                                    </View>
                                : 
                                    <View style={styles.good}>
                                        <FontAwesome5 name="thumbs-up" size={20} color='black' />
                                        <TouchableWithoutFeedback onPress={this.good}>
                                            <Text style={[styles.goodText, {color: 'black'}]}>
                                                좋아요
                                            </Text>
                                        </TouchableWithoutFeedback>
                                    </View>
                                    
                            }
                            <View style={styles.reply}>
                                <FontAwesome5 name="comment-alt" size={20} color="black" />
                                <TouchableWithoutFeedback onPress={() => this.textInputRef.current.focus()}>
                                    <Text style={styles.replyText}>
                                        댓글 달기
                                    </Text>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                        <View style={[styles.goodCount, {justifyContent: 'space-between', alignItems: 'center'}]}>
                            <View style={{flexDirection: 'row'}}>
                                <FontAwesome5 name="thumbs-up" size={20} color='#81d4fa' />
                                {this.state.goodCount === 0 ? 
                                    <Text style={styles.goodCountText}>
                                        제일 먼저 좋아요를 눌러주세요.
                                    </Text>
                                :
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={[styles.goodCountText, {color: '#81d4fa'}]}>
                                            {this.state.goodCount} 
                                        </Text>
                                        <Text style={styles.goodCountText}>
                                            명이 좋아하셨습니다.
                                        </Text>
                                    </View>
                                }
                            </View>
                            <Text style={{color: 'gray', fontSize: 16}}>
                                {this.state.replys.length === 0 ? null : `댓글 ${this.state.replys.length} 개`}
                            </Text>
                        </View>
                        <View style={styles.replyList}>
                            {this.state.replys === 0 ? null :
                                this.state.replys.map((reply, index) => {
                                    const user = store.getState().user;
                                    return(
                                        <View key={reply.uid + index} style={{flexDirection: 'row', marginVertical: 10}}>
                                            <Image source={reply.profilePhotoUrl ? {uri: reply.profilePhotoUrl} : Logo} style={{width:50, height: 50, borderRadius: 20, marginRight: 10}}/>
                                            <View style={reply.uid === user.uid ? {backgroundColor: '#e1f5fe', padding: 10, borderRadius: 10, justifyContent: 'center', flex: 1}: {backgroundColor: '#eeeeee', padding: 10, borderRadius: 10, justifyContent: 'center', flex: 1}}>
                                                <View style={{marginBottom: 10}}>
                                                    <View style={{flexDirection: 'row'}}>
                                                        <Text style={{fontWeight: 'bold', marginRight: 5}}>
                                                            {reply.nick}
                                                        </Text>
                                                        <Text style={{color: '#29b6f6', marginRight: 10}}>
                                                            {memberGradeAlias[reply.grade]}
                                                        </Text>
                                                    </View>
                                                    
                                                    
                                                </View>
                                                <Text style={{fontSize: 18, marginBottom: 10}}>
                                                    {reply.comment}
                                                </Text>
                                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                    <Text style={{color: '#aaaaaa'}}>
                                                            {reply.time ? changeDateFormat(reply.time.toDate()) : null}
                                                    </Text>
                                                    {reply.uid === user.uid && 
                                                        <View style={{flexDirection: 'row'}}>
                                                            <TouchableWithoutFeedback onPress={() => this.setState({replyUpdateModal: true, replyText: reply.comment, updateReplyDocId: reply.replyDocId})}>
                                                                <Text style={{marginRight: 10}}>
                                                                    수정
                                                                </Text>
                                                            </TouchableWithoutFeedback>
                                                            <TouchableWithoutFeedback onPress={() => this.replyDelete(reply.replyDocId)}>
                                                                <Text>
                                                                    삭제
                                                                </Text>
                                                            </TouchableWithoutFeedback>
                                                        </View>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    )
                                })
                            
                            }
                        </View>
                    </View>
                </View>
                </ScrollView>
                <View style={styles.bottom}>
                    <TextInput
                        ref={this.textInputRef}
                        style={styles.replyTextInput}
                        onChangeText={this.onChangeText}
                        value={this.state.text}
                        autoCompleteType="off"
                        autoCorrect={false}
                        maxLength={100}
                        placeholderTextColor="darkgray"
                        textAlign="left"
                        keyboardType="default"
                        placeholder="댓글을 달아주세요."
                    />
                    <View>
                        <TouchableOpacity style={styles.replyButton} onPress={this.replyWrite}>
                            <Text style={styles.replyButtonText}>
                                전송
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Modal 
                    visible={this.state.replyUpdateModal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={() => this.setState({replyUpdateModal: false, replyText: '', updateReplyDocId: ''})}
                >
                    <View style={{
                        backgroundColor: '#00000069', 
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'flex-end'
                    }}>
                        <View style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height/3, backgroundColor: 'white', borderRadius: 20, marginBottom: 20, padding: 20, justifyContent: 'space-evenly'}}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                                댓글수정
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#eeeeee',
                                    fontSize: 18,
                                    padding: 10
                                }}
                                onChangeText={this.onChangeReplyText}
                                value={this.state.replyText}
                                autoCompleteType="off"
                                autoCorrect={false}
                                keyboardType="default"
                                multiline={true}
                                textAlignVertical="top"
                                numberOfLines={3}
                            />
                            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20}}>
                                <TouchableWithoutFeedback onPress={() => this.setState({replyUpdateModal: false, replyText: '', updateReplyDocId: ''})} style={{backgroundColor: 'red', width: 100}}>
                                    <Text style={{fontSize: 18, color: '#01579b'}}>
                                        취소
                                    </Text>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={() => this.updateReply(this.state.updateReplyDocId, this.state.replyText)}>
                                    <Text style={{fontSize: 18, color: '#01579b'}}>
                                        수정
                                    </Text>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal 
                    visible={this.state.popupModal}
                    animationType={'fade'} 
                    transparent={true} 
                    onRequestClose={() => this.setState({popupModal: false})}
                >
                    <TouchableWithoutFeedback onPress={() => this.setState({popupModal: false})}>
                    <View style={{
                        backgroundColor: '#00000000', 
                        flex: 1,
                        alignItems: 'flex-end'
                    }}>
                        <View style={{width: Dimensions.get('window').width / 2, height: Dimensions.get('window').height/6, backgroundColor: '#ffffff', elevation: 10, padding: 20, justifyContent: 'space-between'}}>
                            <TouchableWithoutFeedback onPress={() => this.setState({popupModal: false}, () => this.props.navigation.navigate('SomoimBoardUpdate', {post: this.state.post }))}>
                                <Text style={{fontSize: 18}}>
                                    게시글 수정
                                </Text>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback>
                                <Text style={{fontSize: 18}}>
                                    게시글 삭제
                                </Text>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20
    },
    top: {
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerLeft: {
        flexDirection: 'row'
    },
    profilePhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10
    },
    nickAndGradeAndTime: {
        justifyContent: 'center'
    },
    nickAndGrade: {
        flexDirection: 'row',
        marginBottom: 5
    },
    nickText: {
        fontWeight: 'bold',
        marginRight: 5
    },
    gradeText: {
        color: '#29b6f6'
    },
    timeText: {
        color: 'gray'
    },
    headerRight: {
        justifyContent: 'center'
    },
    categoryText: {
        color: '#29b6f6'
    },
    contents: {
        paddingTop: 10
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },
    contentText: {
        fontSize: 18,
        marginBottom: 10
    },
    contentImages: {
        height: 350, 
        resizeMode: 'center',
        marginBottom: 10
    },
    footer: {

    },
    goodAndReply: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    good: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#dddddd',
        margin: 5,
        padding: 10,
        width: Dimensions.get('window').width / 2.5 
    },
    goodText: {
        marginLeft: 5,
        fontSize: 18
    },
    reply: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#dddddd',
        margin: 5,
        padding: 10,
        width: Dimensions.get('window').width / 2.5,
    },
    replyText: {
        marginLeft: 5,
        fontSize: 18
    },
    goodCount: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#dddddd',
        padding: 10,
        marginTop: 10
    },
    goodCountText: {
        fontSize: 18,
        marginLeft: 5
    },
    replyList: {

    },
    bottom: {
        flexDirection: 'row',
        paddingTop: 20
    },
    replyTextInput: {
        height: 50,
        backgroundColor: '#eeeeee',
        borderRadius: 5,
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 18,
        marginRight: 10
    },
    replyButton: {
        backgroundColor: "#03a9f4",
        width: 60,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    replyButtonText: {
        color: 'white',
        fontSize: 18
    }
})
export default PostInBoard;