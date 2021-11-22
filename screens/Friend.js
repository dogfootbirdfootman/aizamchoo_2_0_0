import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

class Friend extends Component {
    render(){
        return(
            <View style={styles.container}>
                <Text>
                    친구
                </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})
export default Friend;