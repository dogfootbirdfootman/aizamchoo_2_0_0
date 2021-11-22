import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

class Shop extends Component {
    render(){
        return(
            <View style={styles.container}>
                <Text>
                    상점
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
export default Shop;