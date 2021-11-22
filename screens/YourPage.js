import React, { Component } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Image, Modal, Dimensions, Text, ScrollView } from 'react-native';
import Logo from '../assets/logo.png';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileImageContainer: {
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        marginTop: 30
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 70
    },
    userProfileContainer: {
        flexDirection: "column",
        flex: 2,
    },
    userProfileItemContainer: {
        borderBottomWidth: 2,
        borderColor: '#cccccc',
        padding: 10,
        marginBottom: 10,
        flexDirection: 'row',
    },
    userProfileItemTitleContainer: {
        flex: 2
    },
    userProfileItemTitleText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    userProfileItemContentContainer: {
        flex: 5
    },
    userProfileItemContentText: {
        fontSize: 16,
        fontWeight: "bold"
    }
    
})

const listfunc = (title, content, open) => {
    return(
        <View style={styles.userProfileItemContainer}>
            <View style={styles.userProfileItemTitleContainer}>
                <Text style={styles.userProfileItemTitleText}>
                    {title} :
                </Text>
            </View>
            <View style={styles.userProfileItemContentContainer}>
                {Array.isArray(content) ? 
                    content.length === 0 || open === 1 ? 
                        <Text style={styles.userProfileItemContentText}>
                            비공개
                        </Text>
                    :
                        content.map((con, idx) => {
                            return(
                                <Text key={con+idx} style={styles.userProfileItemContentText}>
                                    {idx + 1}. {con}
                                </Text>
                            )
                        })
                :
                    <Text style={styles.userProfileItemContentText}>
                        {open === 0 && content !== null ? content : "비공개"} 
                    </Text>
                }
            </View>
        </View>
    )
}
const changeDateFormat = (date) => {
    return `${date.getFullYear()} 년 ${date.getMonth() + 1} 월 ${date.getDate()} 일`
}
class YourPage extends Component {
    state = {
        user: this.props.route.params,
        viewFullImageModal: false
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.profileImageContainer}>
                    {this.state.user ? 
                        this.state.user.profilePhotoUrl && this.state.user.profilePhotoUrl_open === 0 ?
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
                            this.state.user.profilePhotoUrl && this.state.user.profilePhotoUrl_open === 0 ?
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
                </View>
                <View style={styles.userProfileContainer}>
                    <ScrollView >
                        {listfunc("직업", this.state.user.job, this.state.user.job_open)}
                        {listfunc("학교", this.state.user.school, this.state.user.school_open)}
                        {listfunc("나이", changeDateFormat(this.state.user.age.toDate()), this.state.user.age_open)}
                        {listfunc("지역", this.state.user.address_0 +" "+ this.state.user.address_1, this.state.user.address_open)}
                        {listfunc("키", this.state.user.heightCentimeter, this.state.user.heightCentimeter_open)}
                        {listfunc("종교", this.state.user.religion, this.state.user.religion_open)}
                        {listfunc("연봉", this.state.user.earnPerYear, this.state.user.earnPerYear_open)}
                        {listfunc("가족관계", this.state.user.family ? `${this.state.user.family[0]} 남 ${this.state.user.family[1]} 녀 중 ${this.state.user.family[2]} 째`: null, this.state.user.family_open)}
                        {listfunc("취미", this.state.user.hobby, this.state.user.hobby_open)}
                        {listfunc("음주", this.state.user.drink, this.state.user.drink_open)}
                        {listfunc("흡연", this.state.user.smoke, this.state.user.smoke_open)}
                        {listfunc("성격", this.state.user.character, this.state.user.character_open)}
                        {listfunc("체형", this.state.user.bodyForm, this.state.user.bodyForm_open)}
                        {listfunc("스타일", this.state.user.style, this.state.user.style_open)}
                    </ScrollView>
                </View>
            </View>
        )
    }
}

export default YourPage;