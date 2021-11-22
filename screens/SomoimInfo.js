import React, { Component } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity, ScrollView, Alert, StyleSheet, TouchableWithoutFeedback, Modal } from 'react-native';
import somoimPhoto from '../assets/somoimPhoto.png';
import fb from '../fb';
import firebase from 'firebase/app';
import store from '../store';
import Logo from '../assets/logo.png';
import { MaterialIcons } from '@expo/vector-icons';
import { memberGradeAlias } from '../dbs';

function memberDraw(member){
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginBottom: 20
        },
        imageAndNickTextContainer: {
            flexDirection: 'row', 
            alignItems: 'center'
        },
        image: {
            width: 50, 
            height: 50,
            marginRight: 10,
            borderRadius: 10
        },
        nickText: {
            fontSize: 18, 
            fontWeight: 'bold'
        },
        gradeText: {
            color: '#29b6f6'
        }
    })
    return(
        <View 
            style={styles.container}
            key={member.uid}
        >
            <View  style={styles.imageAndNickTextContainer}>
                <Image 
                    source={member.profilePhotoUrl ? {uri: member.profilePhotoUrl} : Logo} 
                    style={styles.image}/>
                <Text style={styles.nickText}>
                    {member.nick}
                </Text>
            </View>
            <View>
                <Text style={styles.gradeText}>
                    {memberGradeAlias[member.grade]}
                </Text>
            </View>
        </View>
    )
}
const db = fb.firestore();
class SomoimInfo extends Component {
    state = {
        somoimDocId: this.props.route.params.somoim.somoimDocId,
        somoim: {
            address_0: this.props.route.params.somoim.address_0,
            address_1: this.props.route.params.somoim.address_1,
            category: this.props.route.params.somoim.category,
            goal: this.props.route.params.somoim.goal,
            makeTime: this.props.route.params.somoim.makeTime,
            maxPeople: this.props.route.params.somoim.maxPeople,
            name: this.props.route.params.somoim.name,
            photo: this.props.route.params.somoim.photo,
            lastUpdate: this.props.route.params.somoim.lastUpdate,
        },
        membersLength: this.props.route.params.somoim.membersLength,
        grade: this.props.route.params.somoim.grade,
        members: [],
        modal: false
    }
    componentDidMount(){
        this.unsubscribeSomoimMembersUpdate = db.collection(`somoim/${this.state.somoimDocId}/members`).orderBy('grade').onSnapshot(
            async (querySnapshot) => {
                const user = store.getState().user;
                const members = [];
                let grade = 99;
                const promises = querySnapshot.docs.map(async (doc, index) => {
                    const userSnapshots = await db.collection(`users`).where('uid', '==', doc.data().uid).get();
                    if(!userSnapshots.empty){
                        members.push({
                            ...userSnapshots.docs[0].data(), 
                            docId: userSnapshots.docs[0].id, 
                            grade: doc.data().grade
                        })
                    }
                    if(doc.data().uid === user.uid){
                        grade = doc.data().grade
                    }
                })
                await Promise.all(promises)
                this.setState({
                    membersLength: querySnapshot.docs.length,
                    grade,
                    members
                })
            }
        )
        this.unsubscribeSomoimUpdate = db.doc(`somoim/${this.state.somoimDocId}`).onSnapshot((documentSnapshot) => {
            this.setState({
                somoim: documentSnapshot.data()
            })
        })
    }
    componentWillUnmount(){
        this.unsubscribeSomoimMembersUpdate();
        this.unsubscribeSomoimUpdate();
    }
    somoimJoin = (name, somoimDocId) => {
        Alert.alert(
            `${name}`,
            `${name}에 가입 하시겠습니까?`,
            [
                {
                    text: "취소",
                    onPress: () => {
                        return;
                    },
                    style: "cancel"
                },
                { 
                    text: "가입", 
                    onPress: () => {
                        const user = store.getState().user
                        db.collection(`somoim/${somoimDocId}/members`).add({
                            grade: 98,
                            uid: user.uid
                        }).then(res => {
                            db.doc(`somoim/${somoimDocId}`).update({
                                lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
                            })
                        })
                    }
                }
            ],
            { cancelable: false }
          );
    }
    photoPress = (grade) => {
        if(grade === 0){
            this.props.navigation.navigate("SomoimEdit", {somoim: {
                ...this.state.somoim, somoimDocId: this.state.somoimDocId
            }, modal: true})
        }else {
            this.setState({
                modal: true
            })
        }
    }
    render(){
        return(
            <View style={styles.container}>
                <ScrollView>
                <TouchableWithoutFeedback onPress={() => this.photoPress(this.state.grade)}>
                    <Image 
                        source={ this.state.somoim.photo ? {uri: this.state.somoim.photo} : somoimPhoto }
                        style={styles.image}
                    />
                </TouchableWithoutFeedback>
                <View style={styles.contentContainer}>
                    <View style={[styles.categoryAndNameContainer, {justifyContent: 'space-between'}]}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.categoryText}>
                                [{this.state.somoim.category}]
                            </Text>
                            <Text style={styles.nameText}>
                                {this.state.somoim.name}
                            </Text>
                        </View>
                        {this.state.grade === 0 && <View style={{justifyContent:'center'}}>
                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate("SomoimEdit", {somoim: {...this.state.somoim, somoimDocId: this.state.somoimDocId}, modal: false})}>
                                <MaterialIcons name="navigate-next" size={24} color="black" />
                            </TouchableWithoutFeedback>
                        </View>}
                    </View>
                    <View style={styles.goalContainer}>
                        <Text style={styles.goalText}>
                            {this.state.somoim.goal}
                        </Text>
                    </View>
                    {
                        this.state.grade === 99 ?
                            <TouchableOpacity 
                                style={{backgroundColor: '#42a5f5', marginHorizontal: 50, marginVertical: 20, padding: 10, borderRadius: 10}}
                                onPress={() => this.somoimJoin(this.state.somoim.name, this.state.somoimDocId)}
                            >
                                <Text style={{fontSize: 20, textAlign: 'center', color:'white', fontWeight: 'bold'}}>
                                    가입하기
                                </Text>
                            </TouchableOpacity>
                        :
                            null
                    }
                </View>
                <View>
                    <View style={styles.membersLengthContainer}>
                        <Text style={styles.membersLengthText}>
                            모임 멤버 ({this.state.membersLength} 명)
                        </Text>
                    </View>
                    {this.state.members.length !== 0 && 
                        this.state.members.map((member) => {
                            return memberDraw(member)
                        })
                    }
                </View>
                </ScrollView>
                <Modal
                    visible={this.state.modal}
                    animationType={'fade'} 
                    transparent={false} 
                    onRequestClose={() => this.setState({modal: false})}
                >
                    <TouchableWithoutFeedback onPress={() => this.setState({modal: false})}>
                        <Image 
                            style={{
                                width: Dimensions.get("window").width,
                                height: Dimensions.get("window").height,
                                resizeMode: "contain"
                            }}
                            source={ this.state.somoim.photo ? {uri: this.state.somoim.photo} : somoimPhoto }
                    />
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    image: {
        width: Dimensions.get('window').width, 
        height: Dimensions.get('window').width / 3,
        resizeMode: "stretch"
    },
    contentContainer: {
        padding: 20,
        borderBottomWidth: 10,
        borderBottomColor: '#dddddd' 
    },
    categoryAndNameContainer: {
        flexDirection: 'row', 
        marginBottom: 20
    },
    categoryText: {
        fontSize: 20, 
        marginRight: 10
    },
    nameText: {
        fontSize: 20, 
        fontWeight: 'bold'
    },
    goalContainer: {
    },
    goalText: {
        fontSize: 15
    },
    membersLengthContainer: {
        padding: 20
    },
    membersLengthText: {
        fontSize: 17,
        fontWeight: 'bold'
    }
})
export default SomoimInfo;