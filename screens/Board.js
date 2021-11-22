import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

class Board extends Component {
    render(){
        return(
            <View style={styles.container}>
                <Text>
                    게시판
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
export default Board;