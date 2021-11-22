import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ListItem from '../components/ListItem';
import store from '../store';
import { schoolDB, heightCentimeterDB, religionDB, earnPerYearDB, hobbyDB, drinkDB, smokeDB, characterDB, bodyFormDB, styleDB } from '../dbs';
import DatePickerMyInfo from '../components/DatePickerMyInfo';
import LiveInMyInfo from '../components/LiveInMyInfo';
import SingleTextInput from '../components/SingleTextInput';
import PhotoMyInfo from '../components/PhotoMyInfo';
import FamilyMyInfo from '../components/FamilyMyInfo';

class MyInfo extends Component {
    state = {
        user: store.getState().user,
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
                <View style={styles.noticeContainer}>
                    <Text style={styles.noticeText}>
                        기본 정보는 비공개가 원칙이며 상대와 프로필 교환시 공개여부 설정에 따라 상대에게만 공개됩니다.
                    </Text>
                </View>
                <ScrollView style={styles.scrollView}>
                    <ListItem 
                        title="직업"
                        modifiable={false}
                        items={this.state.user?.job}
                        type="immutable"
                        keyword="job"
                    />
                    <ListItem 
                        title="학교"
                        modifiable={true}
                        items={this.state.user?.school}
                        type="modal"
                        resource={schoolDB}
                        keyword="school"
                    />
                    <DatePickerMyInfo />
                    <LiveInMyInfo />
                    <ListItem 
                        title="키"
                        modifiable={true}
                        items={this.state.user?.heightCentimeter}
                        type="modal"
                        resource={heightCentimeterDB}
                        keyword="heightCentimeter"
                    />
                    <SingleTextInput 
                        title="면허번호"
                        keyword="licenseNumber"
                    />
                    <SingleTextInput 
                        title="닉네임"
                        keyword="nick"
                    />
                    <PhotoMyInfo />
                    <ListItem 
                        title="종교"
                        modifiable={true}
                        items={this.state.user?.religion}
                        type="modal"
                        resource={religionDB}
                        keyword="religion"
                    />
                    <ListItem 
                        title="연봉"
                        modifiable={true}
                        items={this.state.user?.earnPerYear}
                        type="modal"
                        resource={earnPerYearDB}
                        keyword="earnPerYear"
                    />
                    <FamilyMyInfo />
                    <ListItem 
                        title="취미"
                        modifiable={true}
                        items={this.state.user?.hobby}
                        type="choice"
                        resource={hobbyDB}
                        keyword="hobby"
                        navigation={this.props.navigation}
                        maxCount={5}
                        textArray={[
                            '어떤 것을 즐겨하시나요?',
                            '취미가 같은 이성 추천에 활용 될 수 있습니다.'
                        ]} 
                    />
                    <ListItem 
                        title="음주"
                        modifiable={true}
                        items={this.state.user?.drink}
                        type="modal"
                        resource={drinkDB}
                        keyword="drink"
                    />
                    <ListItem 
                        title="흡연"
                        modifiable={true}
                        items={this.state.user?.smoke}
                        type="modal"
                        resource={smokeDB}
                        keyword="smoke"
                    />
                    <ListItem 
                        title="성격"
                        modifiable={true}
                        items={this.state.user?.character}
                        type="choice"
                        resource={characterDB}
                        keyword="character"
                        navigation={this.props.navigation}
                        maxCount={5}
                        textArray={[
                            '어떤 성격이신가요?',
                            '회원님을 표현할 수 있는 성격을 선택해주세요.'
                        ]} 
                    />
                    <ListItem 
                        title="체형"
                        modifiable={true}
                        items={this.state.user?.bodyForm}
                        type="modal"
                        resource={bodyFormDB}
                        keyword="bodyForm"
                    />
                    <ListItem 
                        title="스타일"
                        modifiable={true}
                        items={this.state.user?.style}
                        type="modal"
                        resource={styleDB}
                        keyword="style"
                    />
                    <ListItem 
                        title="상대에게 묻고 싶은 질문"
                        modifiable={true}
                        items={this.state.user?.question}
                        type="write"
                        keyword="question"
                        navigation={this.props.navigation}
                        maxCount={10}
                        textArray={[
                            'AI 질문에 자연스럽게 넣어드립니다.',
                            `상대는 내가 질문한 것 인지 모릅니다.`
                        ]} 
                    />
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    noticeContainer: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: "gray",
        padding: 10
    },
    noticeText: {
        fontSize: 16
    },
    scrollView: {
        marginVertical: 30
    },
    itemContainer: {
        marginBottom: 10,
        paddingBottom: 10,
        flexDirection: "row",
        borderBottomWidth: 2,
        borderColor: "#cccccc"
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1
    },
    itemContent: {
        marginLeft: 20,
        flex: 3,
        flexDirection: "row"
    },
    itemContentText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4630eb"
    }
})
export default MyInfo;