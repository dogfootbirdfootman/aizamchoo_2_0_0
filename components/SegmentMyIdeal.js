import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import store from '../store';
import fb from '../fb';

const db = fb.firestore(); 

class SegmentMyIdeal extends Component {
    state = {
        index: 0
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            index: user[this.props.keyword]
        })
    }
    onChangeSegmentedControl = (event) => {
        const index = event.nativeEvent.selectedSegmentIndex;
        this.setState({
            index
        });
        const user = store.getState().user;
        store.dispatch({ type: 'user', user: {...user, [this.props.keyword]: index}});
        db.doc(`users/${user.docId}`).update({[this.props.keyword]: index})
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.labelTextContainer}>
                    <Text style={styles.labelText}>
                        {this.props.title}
                    </Text>
                </View>
                <View style={styles.segmentedControlContainer}>
                    <SegmentedControl
                        values={this.props.resource}
                        selectedIndex={this.state.index}
                        onChange={this.onChangeSegmentedControl}
                    />
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderColor: "#cccccc",
    },
    labelTextContainer: {
    },
    labelText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    segmentedControlContainer: {
    }
})
export default SegmentMyIdeal;