import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

class MainHeader extends Component {
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    {this.props.leftItems.map((item, index) => {
                        return(
                            <TouchableOpacity 
                                key={index + item.goal} 
                                style={styles.leftItemContainer}
                                onPress={() => item.goal === 'back'? this.props.navigation.goBack() : this.props.navigation.navigate(item.goal)}
                            >
                                {item.icon}
                            </TouchableOpacity>
                        )
                    })}
                </View>
                
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>
                        {this.props.title}
                    </Text>
                </View>
                
                <View style={styles.rightContainer}>
                    {this.props.rightItems.map((item, index) => {
                        return(
                            <TouchableOpacity 
                                key={index + item.goal} 
                                style={styles.rightItemContainer}
                                onPress={() => this.props.navigation.navigate(item.goal)}
                            >
                                {item.icon}
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#222222',
        height: 55,
        alignItems: 'center',
        justifyContent: 'center'

    },
    leftContainer: {
        flexDirection: 'row',
        position: 'absolute',
        left: 0,
        alignItems: 'center'
    },
    leftItemContainer: {
        marginHorizontal: 10
    },
    titleContainer: {

    },
    titleText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold'
    },
    rightContainer: {
        flexDirection: 'row',
        position: 'absolute',
        right: 0,
        alignItems: 'center'
    },
    rightItemContainer: {
        marginHorizontal: 10
    }
})
export default MainHeader;