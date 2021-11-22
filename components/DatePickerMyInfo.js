import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import fb from '../fb';
import store from '../store';
import firebase from 'firebase/app';
import OpenDataSetting from './OpenDataSetting';

const db = fb.firestore();
const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        paddingBottom: 10,
        flexDirection: "row",
        borderBottomWidth: 2,
        borderColor: "#cccccc"
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1
    },
    content: {
        marginLeft: 20,
        flex: 3,
        flexDirection: "row"
    },
    contentText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4630eb"
    },
    icon: {
        marginLeft: 20
    }
})

class DatePickerMyInfo extends Component {
    state = {
        dateTimePickerShown: false,
        age: new Date(1990,0,1)
    }
    openDatePicker = () => {
        this.setState({
            dateTimePickerShown: true
        })
    }
    changeDateFormat = (date) => {
        if(date){
            return `${date.getFullYear()} 년 ${date.getMonth() + 1} 월 ${date.getDate()} 일`
        }
    }
    onChangeDateTimePicker = (event, selectedDate) => {
        const user = store.getState().user;
        const currentDate = selectedDate || this.state.age;

        if(event.type === 'set'){
            this.setState({
                age: currentDate,
                dateTimePickerShown: false
            })
            db.doc(`users/${user.docId}`).update({age: currentDate})
            store.dispatch({ type: 'user', user: {...user, age: firebase.firestore.Timestamp.fromDate(currentDate)}});
        }else if(event.type === 'dismissed'){
            this.setState({
                dateTimePickerShown: false,
            })
        }
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            age: user.age.toDate()
        })
    }
    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.label}>
                    생년월일
                </Text>
                <TouchableOpacity style={styles.content} onPress={this.openDatePicker}>
                    <Text style={styles.contentText}>
                        {
                            this.changeDateFormat(this.state.age)
                        }
                    </Text>
                    <OpenDataSetting keyword="age_open"/>
                </TouchableOpacity>
                {this.state.dateTimePickerShown && 
                    <DateTimePicker 
                        value={this.state.age}
                        mode="date"
                        display="default"
                        maximumDate={new Date(2012, 11, 31)}
                        minimumDate={new Date(1950, 0, 1)}
                        onChange={this.onChangeDateTimePicker}
                    />
                }
            </View>
        )
    }
}

export default DatePickerMyInfo;