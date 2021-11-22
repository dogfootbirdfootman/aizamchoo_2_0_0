import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

class ButtonDraw extends Component{
    state = {
        color: 'black'
    }
    render(){
        return(
            this.props.isAnswered ?
                <View 
                    style={styles.container}
                >
                    <Text style={[styles.text, {color: this.state.color}]}>
                        {this.props.text}
                    </Text>
                </View>
            :
                <TouchableOpacity 
                    onPress={() => this.setState({color: 'red'}, this.props.action)} 
                    style={styles.container}
                >
                    <Text style={[styles.text, {color: this.state.color}]}>
                        {this.props.text}
                    </Text>
                </TouchableOpacity>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#222222',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#CDF0EA',
        marginBottom: 10
    },
    text: {
        fontSize: 16,
        textAlign: 'center'
    }
});
export default ButtonDraw;