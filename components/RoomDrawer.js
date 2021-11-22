import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Logo from '../assets/logo.png';
import fb from '../fb';
import { minimalizeAddressDB } from '../dbs';
import store from '../store';
const db = fb.firestore();

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    titleContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#555555'
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    itemContainer: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eeeeee'
    },
    image: {
        width:50, 
        height:50, 
        borderRadius: 10, 
        marginRight: 10
    },
    itemTextContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    nick: {
        fontSize: 18,
        marginRight: 5,
        fontWeight: 'bold'
    },
    job: {
        fontSize: 16,
        marginRight: 5
    },
    sex: {
        fontSize: 16,
        marginRight: 5
    },
    address_0: {
        fontSize: 16,
        marginRight: 5
    },
    iam: {
        backgroundColor: '#555555',
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 5,
        borderRadius: 10
    },
    bangjang: {
        color: 'white',
        backgroundColor: 'green',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 'bold',
        padding: 5,
        marginRight: 5
    }
})
class RoomDrawer extends Component {
    state = {
        member: [this.props.state.routes[0].params.memberData],
        myData: store.getState().user,
        room: this.props.state.routes[0].params.roomData
    }
    componentDidMount() {
        const roomId = this.props.state.routes[0].params.roomId;
        this.unsubscribeMember = db.collection("rooms").doc(roomId).collection("member").onSnapshot((querySnapshot) => {
            const member = querySnapshot.docs.map((doc, index) => {
                return {...doc.data(), memberId: doc.id}
            })
            this.setState({
                member
            })
        })
        this.unsubscribeRoom = db.collection("rooms").doc(roomId).onSnapshot((documentSnapshot) => {
            const room = documentSnapshot.data()
            this.setState({
                room
            })
        })
    }
    componentWillUnmount(){
        this.unsubscribeMember();
        this.unsubscribeRoom();
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>
                        대화 상대
                    </Text>
                </View>
                <TouchableOpacity style={styles.itemContainer} onPress={() => this.props.navigation.navigate("YourPage", this.state.myData)}>
                    <Image 
                        style={styles.image}
                        source={this.state.myData.profilePhotoUrl && this.state.myData.profilePhotoUrl_open === 0 ? {uri: this.state.myData.profilePhotoUrl} : Logo}
                    />
                    <View style={styles.itemTextContainer}>
                        {this.state.room.master.uid === this.state.myData.uid ? 
                            <Text style={styles.bangjang}>
                                방장
                            </Text>
                        :
                            null
                        }
                        <Text style={[styles.nick, {color: "blue"}]}>
                            {this.state.myData.nick_open === 0 ? this.state.myData.nick : "?"}
                        </Text>
                        <Text style={styles.iam}>
                            나
                        </Text>
                    </View>   
                </TouchableOpacity>
                {
                    this.state.member.map((user, index) => {
                        if(this.state.myData.uid === user.uid){
                            return
                        }else {
                            return(
                                <TouchableOpacity key={user.uid + index} style={styles.itemContainer} onPress={() => this.props.navigation.navigate("YourPage", user)}>
                                    <Image 
                                        style={styles.image}
                                        source={user.profilePhotoUrl && user.profilePhotoUrl_open === 0 ? {uri: user.profilePhotoUrl} : Logo}
                                    />
                                    <View style={styles.itemTextContainer}>
                                        {this.state.room.master.uid === user.uid ? 
                                            <Text style={styles.bangjang}>
                                                방장
                                            </Text>
                                        :
                                            null
                                        }
                                        <Text style={[styles.nick, {color: "black"}]}>
                                            {user.nick_open === 0 ? user.nick : "?"}
                                        </Text>
                                        <Text style={styles.job}>
                                            ( {user.job_open === 0 ? user.job : "?"} /
                                        </Text>
                                        <Text style={styles.sex}>
                                            {user.sex[0]} /
                                        </Text>
                                        <Text style={styles.address_0}>
                                            {user.address_open === 0 ? minimalizeAddressDB[user.address_0] : "?"} )
                                        </Text>
                                    </View>   
                                </TouchableOpacity>
                            )
                        }
                    })
                }
            </View>
        )
    }
}

export default RoomDrawer;