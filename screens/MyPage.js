import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import store from '../store';
import { FontAwesome5 } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../assets/logo.png';

class MyPage extends Component {
    state = {
        user: store.getState().user,
        viewFullImageModal: false
    }
    setUser = () => {
        this.setState({
            user: store.getState().user
        })
    }
    componentDidMount(){
        this.unsubscribe = store.subscribe(this.setUser);
    }
    componentWillUnmount(){
        this.unsubscribe();
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.profile}>
                    {this.state.user ? 
                        this.state.user.profilePhotoUrl ?
                            <TouchableWithoutFeedback onPress={() => this.setState({viewFullImageModal: true})}>
                                <Image
                                    style={styles.profileImage}
                                    source={{uri: this.state.user.profilePhotoUrl}}
                                    />
                            </TouchableWithoutFeedback>
                        :
                            <TouchableWithoutFeedback onPress={() => this.setState({viewFullImageModal: true})}>
                                <Image style={styles.profileImage} source={Logo}/>
                            </TouchableWithoutFeedback>
                    :
                        <TouchableWithoutFeedback onPress={() => this.setState({viewFullImageModal: true})}>
                            <Image style={styles.profileImage} source={Logo}/>
                        </TouchableWithoutFeedback>
                    }
                    <Modal
                        visible={this.state.viewFullImageModal}
                        animationType={'fade'} 
                        transparent={false} 
                        onRequestClose={() => this.setState({viewFullImageModal: false})}
                    >
                        {this.state.user ? 
                            this.state.user.profilePhotoUrl ?
                                <TouchableWithoutFeedback onPress={() => this.setState({viewFullImageModal: false})}>
                                    <Image 
                                        style={{
                                            width: Dimensions.get("window").width,
                                            height: Dimensions.get("window").height,
                                            resizeMode: "contain"
                                        }}
                                        source={{uri: this.state.user.profilePhotoUrl}}
                                />
                                </TouchableWithoutFeedback>
                            :
                                <TouchableWithoutFeedback onPress={() => this.setState({viewFullImageModal: false})}>
                                    <Image style={{
                                        width: Dimensions.get("window").width,
                                        height: Dimensions.get("window").height,
                                        resizeMode: "contain"
                                    }} source={Logo}/>
                                </TouchableWithoutFeedback>        
                                
                        :
                            <TouchableWithoutFeedback onPress={() => this.setState({viewFullImageModal: false})}>
                                <Image style={{
                                    width: Dimensions.get("window").width,
                                    height: Dimensions.get("window").height,
                                    resizeMode: "contain"
                                }} source={Logo}/>
                            </TouchableWithoutFeedback>
                        }
                    </Modal>
                    <Text style={styles.profileText}>
                        {this.state.user?.nick}
                    </Text>
                </View>
                <View style={styles.menuButtons}>
                    <View style={styles.topMenuButtons}>
                        <TouchableOpacity style={styles.menuButton} onPress={() => this.props.navigation.navigate("MyInfo")}>
                            <FontAwesome5 name="user" size={24} color="black" />
                            <Text style={styles.menuButtonText}>
                                나의 정보
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton} onPress={() => this.props.navigation.navigate("MyIdeal")}>
                            <FontAwesome5 name="user-friends" size={24} color="black" />
                            <Text style={styles.menuButtonText}>
                                나의 이상형
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton}>
                            <FontAwesome5 name="user-shield" size={24} color="black" />
                            <Text style={styles.menuButtonText}>
                                지인 차단
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bottomMenuButtons}>
                        <TouchableOpacity style={styles.menuButton}>
                            <FontAwesome5 name="user-cog" size={24} color="black" />
                            <Text style={styles.menuButtonText}>
                                계정관리
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton}>
                            <AntDesign name="customerservice" size={24} color="black" />
                            <Text style={styles.menuButtonText}>
                                문의하기
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton}>
                            <MaterialIcons name="attach-money" size={24} color="black" />
                            <Text style={styles.menuButtonText}>
                                내 멤버쉽
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30
    },
    profile: {
        flexDirection: "column",
        alignItems: "center",
        flex: 1
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 70
    },
    profileText: {
        marginTop: 10,
        fontSize: 20
    },
    menuButtons: {
        flexDirection: "column",
        flex: 1
    },
    topMenuButtons: {
        flexDirection: "row"
    },
    bottomMenuButtons: {
        flexDirection: "row"
    },
    menuButton: {
        width: Dimensions.get('window').width/ 4,
        height: Dimensions.get('window').height/ 8,
        margin: 5,
        backgroundColor: "#dddddd",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    menuButtonText: {
        marginTop: 5
    }
})
export default MyPage;