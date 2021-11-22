import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import store from '../store';
import fb from '../fb';
const db = fb.firestore();

class HeightMyIdeal extends Component {
    state = {
        value: [140, 200]
    }
    componentDidMount(){
        const user = store.getState().user;
        this.setState({
            value: user.height_y
        })
    }
    save = () => {
        const user = store.getState().user;
        store.dispatch({ type: 'user', user: {...user, height_y: this.state.value}});
        db.doc(`users/${user.docId}`).update({height_y: this.state.value})
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.firstLayer}>
                    <View style={styles.labelTextContainer}>
                        <Text style={styles.labelText}>
                            키
                        </Text>
                    </View>
                    <View style={styles.sliderContainer}>
                        <MultiSlider 
                            min={140}
                            max={200}
                            values={this.state.value}
                            sliderLength={Dimensions.get("window").width/2}
                            onValuesChange={(value) => this.setState({value})}
                            onValuesChangeFinish={this.save}
                            markerStyle={{width: 20, height: 20, borderRadius: 10, backgroundColor: 'blue'}}
                            selectedStyle={{backgroundColor:'blue'}}
                        />
                    </View>
                </View>
                <View style={styles.secondLayer}>
                    <View style={styles.secondLayerTextContainer}>
                        <View style={styles.secondLayerFirstTextContainer}>
                            <Text style={styles.changeableText}>
                                {this.state.value[0]}
                            </Text>
                            <Text style={styles.unchangeableText}>
                                cm 부터
                            </Text>
                        </View>
                        <View style={styles.secondLayerSecondTextContainer}>
                            <Text style={styles.changeableText}>
                                {this.state.value[1]}
                            </Text>
                            <Text style={styles.unchangeableText}>
                                cm 까지
                            </Text>
                        </View>
                    </View>
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
        borderColor: "#cccccc"
    },
    firstLayer: {
        flexDirection: "row"
    },
    labelTextContainer: {
        flex: 1
    },
    labelText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    sliderContainer: {
        flex: 3
    },
    secondLayer: {
    },
    secondLayerTextContainer:{
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    secondLayerFirstTextContainer: {
        flexDirection: "row"
    },
    secondLayerSecondTextContainer: {
        flexDirection: "row"
    },
    changeableText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4630eb"
    },
    unchangeableText: {
        fontSize: 16,
        color: "black"
    }
});

export default HeightMyIdeal;