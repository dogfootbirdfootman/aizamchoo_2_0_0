import React, { Component } from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import SomoimInfo from '../screens/SomoimInfo';
import SomoimBoard from '../screens/SomoimBoard';
import SomoimPhoto from '../screens/SomoimPhoto';
import SomoimChat from '../screens/SomoimChat';

const Tab = createMaterialTopTabNavigator();

class SomoimPageTopTab extends Component {
    render(){
        return (
            <Tab.Navigator>
                <Tab.Screen name="정보" component={SomoimInfo} initialParams={this.props.route.params} />
                <Tab.Screen name="게시판" component={SomoimBoard} initialParams={this.props.route.params}/>
                <Tab.Screen name="사진첩" component={SomoimPhoto} initialParams={this.props.route.params}/>
                <Tab.Screen name="채팅" component={SomoimChat} initialParams={this.props.route.params}/>
            </Tab.Navigator>
        );
    }
}

export default SomoimPageTopTab