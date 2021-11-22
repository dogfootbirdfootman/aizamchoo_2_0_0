import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider'

class AgeRoomCondition extends Component {
    state = {
        value: [20, 50],
        standYear: new Date(Date.now()).getFullYear() + 1
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.firstLayer}>
                    <View style={styles.labelTextContainer}>
                        <Text style={styles.labelText}>
                            나이 설정
                        </Text>
                    </View>
                    <View style={styles.sliderContainer}>
                        <MultiSlider 
                            min={20}
                            max={50}
                            values={this.state.value}
                            sliderLength={Dimensions.get("window").width/4}
                            onValuesChange={(value) => this.setState({value})}
                            onValuesChangeFinish={() => this.props.onChangeAgeLimit(this.state.value)}
                            markerStyle={{width: 20, height: 20, borderRadius: 10, backgroundColor: 'blue'}}
                            selectedStyle={{backgroundColor:'blue'}}
                        />
                    </View>
                </View>
                <View style={styles.secondLayer}>
                    <View style={styles.secondLayerTextContainer}>
                        <View style={styles.secondLayerFirstTextContainer}>
                            <Text style={styles.changeableText}>
                                {this.state.standYear - this.state.value[0]}
                            </Text>
                            <Text style={styles.unchangeableText}>
                                년생(
                            </Text>
                            <Text style={styles.changeableText}>
                                {this.state.value[0]}
                            </Text>
                            <Text style={styles.unchangeableText}>
                                ) 부터
                            </Text>
                        </View>
                        <View style={styles.secondLayerSecondTextContainer}>
                            <Text style={styles.changeableText}>
                                {this.state.standYear - this.state.value[1]}
                            </Text>
                            <Text style={styles.unchangeableText}>
                                년생(
                            </Text>
                            <Text style={styles.changeableText}>
                                {this.state.value[1]}
                            </Text>
                            <Text style={styles.unchangeableText}>
                                ) 까지
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
        padding: 10
    },
    firstLayer: {
        flexDirection: "row",
    },
    labelTextContainer: {
        flex: 1
    },
    labelText: {
        fontSize: 20
    },
    sliderContainer: {
        flex: 1
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
        fontSize: 14,
        fontWeight: "bold",
        color: "#4630eb"
    },
    unchangeableText: {
        fontSize: 14,
        color: "black"
    }
});

export default AgeRoomCondition;