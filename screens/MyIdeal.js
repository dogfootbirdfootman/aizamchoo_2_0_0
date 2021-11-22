import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import store from '../store';
import ListItem from '../components/ListItem';
import { jobDB, schoolSegmentDB, addressDB, religionDB, hobbyDB, drinkSegmentDB, smokeSegmentDB, bodyFormDB, characterDB, styleDB } from '../dbs';
import SegmentMyIdeal from '../components/SegmentMyIdeal';
import AgeMyIdeal from '../components/AgeMyIdeal';
import HeightMyIdeal from '../components/HeightMyIdeal';
import EarnMyIdeal from '../components/EarnMyIdeal';

const addressList = Object.keys(addressDB).map((v,i) => {
    return v
})
class MyIdealType extends Component {
    state = {
        user: store.getState().user
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
                        AI 쟈만츄가 나의 이상형을 찾아 추천해 드립니다.
                    </Text>
                </View>
                <ScrollView style={styles.scrollView}>
                    <ListItem 
                        title="직업"
                        modifiable={true}
                        items={this.state.user?.job_y}
                        type="idealChoice"
                        resource={jobDB}
                        keyword="job_y"
                        navigation={this.props.navigation}
                    />
                    <SegmentMyIdeal 
                        title="학교"
                        keyword="school_y"
                        resource={schoolSegmentDB}
                    />
                    <AgeMyIdeal />
                    <HeightMyIdeal />
                    <ListItem 
                        title="지역"
                        modifiable={true}
                        items={this.state.user?.address_y}
                        type="idealChoice"
                        resource={addressList}
                        keyword="address_y"
                        navigation={this.props.navigation}
                    />
                    <ListItem 
                        title="종교"
                        modifiable={true}
                        items={this.state.user?.religion_y}
                        type="idealChoice"
                        resource={religionDB}
                        keyword="religion_y"
                        navigation={this.props.navigation}
                    />
                    <EarnMyIdeal />
                    <ListItem 
                        title="취미"
                        modifiable={true}
                        items={this.state.user?.hobby_y}
                        type="idealChoice"
                        resource={hobbyDB}
                        keyword="hobby_y"
                        navigation={this.props.navigation}
                    />
                    <SegmentMyIdeal 
                        title="음주"
                        keyword="drink_y"
                        resource={drinkSegmentDB}
                    />
                    <SegmentMyIdeal 
                        title="흡연"
                        keyword="smoke_y"
                        resource={smokeSegmentDB}
                    />
                    <ListItem 
                        title="체형"
                        modifiable={true}
                        items={this.state.user?.bodyForm_y}
                        type="idealChoice"
                        resource={bodyFormDB}
                        keyword="bodyForm_y"
                        navigation={this.props.navigation}
                    />
                    <ListItem 
                        title="성격"
                        modifiable={true}
                        items={this.state.user?.character_y}
                        type="idealChoice"
                        resource={characterDB}
                        keyword="character_y"
                        navigation={this.props.navigation}
                    />
                    <ListItem 
                        title="스타일"
                        modifiable={true}
                        items={this.state.user?.style_y}
                        type="idealChoice"
                        resource={styleDB}
                        keyword="style_y"
                        navigation={this.props.navigation}
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
    }
})

export default MyIdealType;
