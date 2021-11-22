import React, { Component } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, ScrollView, Text, Image, TouchableWithoutFeedback } from 'react-native';
import { somoimBoardCategory } from '../dbs';
import { Picker } from '@react-native-picker/picker';
import { Fontisto } from '@expo/vector-icons';
import fb from '../fb';
import { memberGradeAlias } from '../dbs';
import { FontAwesome5 } from '@expo/vector-icons';
import Logo from '../assets/logo.png';

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
const cutContentText = (text, num) => {
    let result;

    if(text.length > num){
        result = text.slice(0, num) + '...'
    }else {
        result = text
    }
    return result;
}
class SomoimBoard extends Component {
    state = {
        somoimBoardCategory: '전체보기',
        fadeAnim: new Animated.Value(1),
        posts: []
    }
    componentDidMount(){
        this.unsubscribeContents = db.collection(`somoim/${this.props.route.params.somoim.somoimDocId}/board`).orderBy("time", "desc").onSnapshot(async (querySnapshot) => {
            const posts = [];
            const promises = querySnapshot.docs.map(async (doc, index) => {
                const postData = doc.data();

                const usersnapshot = await db.collection(`users`).where("uid", "==", postData.writerUid).get();
                const userData = usersnapshot.docs[0].data()

                const membersnapshot = await db.collection(`somoim/${this.props.route.params.somoim.somoimDocId}/members`).where("uid", "==", postData.writerUid).get();
                const memberData = membersnapshot.docs[0].data();

                const goodCountsnapshot =  await db.collection(`somoim/${this.props.route.params.somoim.somoimDocId}/board/${doc.id}/good`).get();
                let goodCount = 0;
                if(!goodCountsnapshot.empty){
                    goodCount = goodCountsnapshot.docs.length;
                }

                const replyCountsnapshot =  await db.collection(`somoim/${this.props.route.params.somoim.somoimDocId}/board/${doc.id}/reply`).get();
                let replyCount = 0;
                if(!replyCountsnapshot.empty){
                    replyCount = replyCountsnapshot.docs.length;
                }
                
                posts.push({...postData, postDocId: doc.id, nick: userData.nick, profilePhotoUrl: userData.profilePhotoUrl, grade: memberData.grade, somoimDocId: this.props.route.params.somoim.somoimDocId, goodCount, replyCount});
            })
            await Promise.all(promises)
            this.setState({posts})
        })
    }
    componentWillUnmount(){
        this.unsubscribeContents();
    }
    fadeIn = () => {
        Animated.timing(this.state.fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start();
    };
    fadeOut = () => {
        Animated.timing(this.state.fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    };
    write = () => {
        this.props.navigation.navigate('SomoimBoardWrite', {somoim: this.props.route.params.somoim})
    }
    getUserData = async (writerDocId) => {
        const userData = await db.doc(`users/${writerDocId}`).get();
        return userData.data()
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.picker}>
                        <Picker 
                            dropdownIconColor="gray"
                            selectedValue={this.state.somoimBoardCategory}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({somoimBoardCategory: itemValue});
                            }}>
                            {['전체보기', ...somoimBoardCategory].map((v,i) => {
                                return <Picker.Item label={v} value={v} key={i+v}/>
                            })}
                        </Picker>
                    </View>
                </View>
                
                <ScrollView onScrollBeginDrag={this.fadeOut} onScrollEndDrag={this.fadeIn}>
                    <View style={styles.posts}>
                        {this.state.posts.length !== 0 ? 
                            this.state.somoimBoardCategory === "전체보기" ? 
                                this.state.posts.map((post, index) => {
                                    return(
                                        <TouchableWithoutFeedback key={post.postDocId + index} onPress={() => this.props.navigation.navigate("PostInBoard", {post: post})}>
                                        <View  style={styles.postContainer}>
                                            <View style={styles.postTop}>
                                                <View style={styles.postWriterInfos}>
                                                    <Image 
                                                        source={post.profilePhotoUrl ? {uri:  post.profilePhotoUrl} : Logo} 
                                                        style={styles.postWriterPhoto}/>
                                                    <Text style={styles.postWriterNickText}>
                                                        {post.nick}
                                                    </Text>
                                                    <Text style={styles.postWriterGradeText}>
                                                        {memberGradeAlias[post.grade]}
                                                    </Text>
                                                </View>
                                                <Text style={styles.postTimeText}>
                                                    {post.time ? changeDateFormat(post.time.toDate()): null}
                                                </Text>
                                            </View>
                                            
                                            <View style={styles.postMiddle}>
                                                <View style={styles.postPriview}>
                                                    <Text style={styles.postTitleText}>
                                                        {post.title ? cutContentText(post.title, 15): null}
                                                    </Text>
                                                    <Text style={styles.postContentText}>
                                                        {post.content ? cutContentText(post.content, 20): null}
                                                    </Text>
                                                </View>
                                                <View style={styles.postContentImageContainer}>
                                                    {post.photoUris ? 
                                                        <Image source={{uri: post.photoUris[0]}} style={styles.postImage}/>
                                                    : null}
                                                </View>
                                            </View>
                                            <View style={styles.postBottom}>
                                                <View style={{flexDirection: 'row'}}>
                                                    {post.goodCount === 0 ?  
                                                        null
                                                    : 
                                                        <View style={[styles.postBottomLeft, {marginRight: 20}]}>
                                                            <FontAwesome5 name="thumbs-up" size={16} color="black" />
                                                            <Text style={styles.postBottomLeftText}>
                                                                좋아요
                                                            </Text>
                                                            <Text style={styles.postBottomLeftCount}>
                                                                {post.goodCount}
                                                            </Text>
                                                        </View>
                                                    }
                                                    {post.replyCount === 0 ?  
                                                        null
                                                    : 
                                                        <View style={styles.postBottomLeft}>
                                                            <FontAwesome5 name="comment-alt" size={16} color="black" />
                                                            <Text style={styles.postBottomLeftText}>
                                                                댓글
                                                            </Text>
                                                            <Text style={styles.postBottomLeftCount}>
                                                                {post.replyCount}
                                                            </Text>
                                                        </View>
                                                    }
                                                </View>
                                                
                                                
                                                <Text style={styles.postCategoryText}>
                                                    {post.category}
                                                </Text>
                                            </View>
                                        </View>
                                        </TouchableWithoutFeedback>
                                    )
                                })
                            : 

                                this.state.posts.map((post, index) => {
                                    if(post.category === this.state.somoimBoardCategory){
                                        return(
                                            <TouchableWithoutFeedback key={post.postDocId + index} onPress={() => this.props.navigation.navigate("PostInBoard", {post: post})}>
                                            <View key={post.postDocId + index} style={styles.postContainer}>
                                                <View style={styles.postTop}>
                                                    <View style={styles.postWriterInfos}>
                                                        <Image 
                                                            source={{uri: post.profilePhotoUrl}} 
                                                            style={styles.postWriterPhoto}/>
                                                        <Text style={styles.postWriterNickText}>
                                                            {post.nick}
                                                        </Text>
                                                        <Text style={styles.postWriterGradeText}>
                                                            {memberGradeAlias[post.grade]}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.postTimeText}>
                                                        {post.time ? changeDateFormat(post.time.toDate()): null}
                                                    </Text>
                                                </View>
                                                
                                                <View style={styles.postMiddle}>
                                                    <View style={styles.postPriview}>
                                                        <Text style={styles.postTitleText}>
                                                            {post.title ? cutContentText(post.title, 15): null}
                                                        </Text>
                                                        <Text style={styles.postContentText}>
                                                            {post.content ? cutContentText(post.content, 20): null}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.postContentImageContainer}>
                                                        {post.photoUris ? 
                                                            <Image source={{uri: post.photoUris[0]}} style={styles.postImage}/>
                                                        : null}
                                                    </View>
                                                </View>
                                                <View style={styles.postBottom}>
                                                    <Text style={styles.postCategoryText}>
                                                        {post.category}
                                                    </Text>
                                                </View>
                                            </View>
                                            </TouchableWithoutFeedback>
                                        )
                                    }
                                })
                        : null}
                    </View>
                </ScrollView>
                <Animated.View style={[styles.floatingButton, { opacity: this.state.fadeAnim }]}>
                    <TouchableOpacity onPress={this.write}>
                        <Fontisto name="plus-a" size={35} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        padding: 20
    },
    picker: {
        width: 180,
        borderWidth: 1,
        borderColor: '#dddddd',
        padding: 10,
        borderRadius: 20
    },
    posts: {

    },
    floatingButton:{
        backgroundColor: '#03a9f4',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        right: 30,
        bottom: 30,
        borderRadius: 25,
        elevation: 10,
    },
    postContainer: {
        paddingHorizontal: 20,
        borderBottomWidth: 10,
        borderColor: '#eeeeee',
        marginBottom: 10
    },
    postTop: {
        flexDirection: 'row', 
        justifyContent:'space-between',
        alignItems: 'center',
    },
    postMiddle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#dddddd',
        paddingVertical: 20
    },
    postBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10
    },
    postBottomLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    postBottomLeftText: {
        marginHorizontal: 5
    },
    postBottomLeftCount: {
        color: '#81d4fa'
    },
    postWriterInfos: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    postWriterPhoto: {
        width:30, 
        height: 30,
        marginRight: 10
    },
    postWriterNickText: {
        fontWeight: 'bold',
        marginRight: 3
    },
    postWriterGradeText: {
        color: '#29b6f6'
    },
    postTimeText: {
        color: 'gray'
    },
    postPriview: {
        maxWidth: 200
    },
    postContentImageContainer: {
    },
    postTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 5
    },
    postContentText: {
        marginVertical: 5,
        fontSize: 16
    },
    postImage: {
        width: 100, 
        height: 60,
        borderRadius: 10
    },
    postCategoryText: {
        color: 'gray'
    }
})
export default SomoimBoard;