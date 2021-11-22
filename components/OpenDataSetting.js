import React, { Component } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import store from '../store';
import fb from '../fb';
const db = fb.firestore();
const styles = StyleSheet.create({
    segment: {
        height: 25,
        marginLeft: 20,
        width: 90
    }
})
class OpenDataSetting extends Component {
    state = {
        index: 0
    }
    componentDidMount(){
        const user = store.getState().user;
        const index = user[this.props.keyword];
        this.setState({
            index
        })
    }
    onChangeSegmentedControl = (event) => {
        const user = store.getState().user;
        const index = event.nativeEvent.selectedSegmentIndex;
        const message = index === 0 ? "공개" : "비공개"
        this.setState({
            index
        });
        store.dispatch({ type: 'user', user: {...user, [this.props.keyword]: index}});
        db.collection("users").doc(user.docId).update({[this.props.keyword]: index});
        Alert.alert('정보 설정',`${message} 로 전환합니다.`);
    }
    render(){
        return(
            <View>
                <SegmentedControl
                    values={["공개", "비공개"]}
                    selectedIndex={this.state.index}
                    onChange={this.onChangeSegmentedControl}
                    style={styles.segment}
                    tintColor="white"
                    backgroundColor="white"
                    fontStyle={{
                        color:"#dddddd"
                    }}
                    activeFontStyle={{
                        color:"black"
                    }}
                    enabled={this.props.enabled}
                />
            </View>
        )
    }
}

export default OpenDataSetting;