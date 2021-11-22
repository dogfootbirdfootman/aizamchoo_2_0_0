import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

class Chat extends Component {
    render(){
        return(
            <View style={styles.container}>
                <Text>
                    채팅
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
export default Chat;