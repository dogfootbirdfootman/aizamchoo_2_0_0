import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import fb from '../fb';
import somoimPhoto from '../assets/somoimPhoto.png';
import { FontAwesome5 } from '@expo/vector-icons';
import { somoimCategoryDB } from '../dbs';
import store from '../store';
const db = fb.firestore();

function previewSomoimDraw(somoim, move){
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',padding: 20
        },
        image: {
            width:100, 
            height: 71, 
            marginRight: 20, 
            borderRadius: 5, 
            resizeMode: "stretch"
        },
        contentContainer: {
            justifyContent: 'space-between'
        },
        categoryText: {
            color: '#03a9f4'
        },
        nameText: {
            fontSize: 18, fontWeight: 'bold'
        },
        membersLengthContainer: {
            flexDirection: 'row'
        },
        membersLengthText: {
            marginLeft: 20
        }
    })
    return(
        <TouchableOpacity onPress={move} style={styles.container}>
            <Image source={somoim.photo ? {uri: somoim.photo} : somoimPhoto} style={styles.image}/>
            <View style={styles.contentContainer}>
                <Text style={styles.categoryText}>
                    {somoim.category}
                </Text>
                <Text style={styles.nameText}>
                    {somoim.name}
                </Text>
                <View style={styles.membersLengthContainer}>
                    <FontAwesome5 name="user" size={16} color="black" />
                    <Text style={styles.membersLengthText}>
                        {somoim.membersLength} 명
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
function labelDraw(text){
    const styles = StyleSheet.create({
        container: {
            paddingLeft: 20
        },
        text: {
            fontSize: 20, 
            fontWeight: 'bold'
        }
    })
    return(
        <View style={styles.container}>
            <Text style={styles.text}>
                {text}
            </Text>
        </View>
    )
}
class Somoim extends Component {
    state = {
        fadeAnim: new Animated.Value(1),
        categorySearch: '전체',
        mySomoimList: [],
        otherSomoimList: []
    }
    componentDidMount(){
        const user = store.getState().user;
        this.unsubscribeSomoimUpdate = db.collection('somoim').orderBy('makeTime').onSnapshot(
            async (somoimsSnapshot) => {
                const mySomoimList = [];
                const otherSomoimList = [];
                const promises = somoimsSnapshot.docs.map(async (somoimSnapshot, index) => { 
                    const allMembersSnapshot = await db.collection(`somoim/${somoimSnapshot.id}/members`).get();
                    const idx = allMembersSnapshot.docs.findIndex((memberSnapshot) => memberSnapshot.data().uid === user.uid);
                    if(idx === -1){
                        otherSomoimList.push({
                            ...somoimSnapshot.data(), 
                            somoimDocId: somoimSnapshot.id,
                            membersLength: allMembersSnapshot.docs.length,
                            grade: 99
                        })
                    }else{
                        mySomoimList.push({
                            ...somoimSnapshot.data(), 
                            somoimDocId: somoimSnapshot.id,
                            membersLength: allMembersSnapshot.docs.length,
                            grade: allMembersSnapshot.docs[idx].data().grade
                        })
                    }
                })
                await Promise.all(promises)
                this.setState({
                    mySomoimList,
                    otherSomoimList
                })
            }
        )
    }
    componentWillUnmount(){
        this.unsubscribeSomoimUpdate();
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
    make = () =>{
        this.props.navigation.navigate("SomoimMake")
    }
    move = (somoim) => {
        this.props.navigation.navigate('SomoimPageTopTab', {somoim: somoim})
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.categorySearchScrollContainer}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                        {["전체", ...somoimCategoryDB].map((item, index) => {
                            return(
                                <TouchableOpacity 
                                    key={item+index} 
                                    style={[styles.categorySearchItemContainer, {
                                        backgroundColor: this.state.categorySearch === item ? 'black' : '#dddddd'
                                    }]}
                                    onPress={() => this.setState({ categorySearch: item })}
                                >
                                    <Text style={[styles.categorySearchItemText, {
                                        color: this.state.categorySearch === item ? 'white' : 'black'
                                    }]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
                <ScrollView onScrollBeginDrag={this.fadeOut} onScrollEndDrag={this.fadeIn}>
                    {
                        this.state.categorySearch === "전체" ? 
                            this.state.mySomoimList.map((somoim, index) => {
                                if(index === 0){
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {labelDraw('가입한 모임')}
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    )
                                }else{
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    )
                                }
                            })
                        :
                            this.state.mySomoimList.filter(somoim => somoim.category === this.state.categorySearch).map((somoim, index) => {
                                if(index === 0){
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {labelDraw('가입한 모임')}
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    )
                                }else{
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    ) 
                                }
                            })
                    }
                    {
                        this.state.categorySearch === "전체" ? 
                            this.state.otherSomoimList.map((somoim, index) => {
                                if(index === 0){
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {labelDraw('아직 가입하지 않은 모임')}
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    )
                                }else{
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    )
                                }
                            })
                        :
                            this.state.otherSomoimList.filter(somoim => somoim.category === this.state.categorySearch).map((somoim, index) => {
                                if(index === 0){
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {labelDraw('아직 가입하지 않은 모임')}
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    )
                                }else{
                                    return(
                                        <View key={somoim.somoimDocId + index}>
                                            {previewSomoimDraw(somoim, () => this.move(somoim))}
                                        </View>
                                    )
                                }
                            })
                    }
                </ScrollView>
                <Animated.View style={[styles.floatingButton, { opacity: this.state.fadeAnim }]}>
                    <TouchableOpacity onPress={this.make}>
                        <Fontisto name="plus-a" size={35} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    categorySearchScrollContainer: {
        padding: 20
    },
    categorySearchItemContainer: {
        width: 100, 
        height:30, 
        marginRight: 10, 
        borderRadius: 10, 
        justifyContent: 'center'
    },
    categorySearchItemText: {
        textAlign: 'center'
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
    }
})

export default Somoim;