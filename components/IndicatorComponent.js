import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

class IndicatorComponent extends Component {
  render(){
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff"/>
        </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff00",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        padding: 30
    }
});

export default IndicatorComponent;