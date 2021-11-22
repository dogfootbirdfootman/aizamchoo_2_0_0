import React, { Component } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Somoim from '../screens/Somoim';
import Chat from '../screens/Chat';
import Board from '../screens/Board';
import Friend from '../screens/Friend';
import { FontAwesome5 } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const focusedColor = '#000000';
const unfocusedColor = '#aaaaaa';
const tabBarBackgroundColor = '#dddddd';

const iconNameChange = (routeName) => {
    if(routeName === 'Home'){
       return 'home'
    }else if(routeName === 'Somoim'){
       return 'people-carry'
    }else if(routeName === 'Chat'){
       return 'rocketchat'
    }else if(routeName === 'Board'){
       return 'clipboard-list'
    }else if(routeName === 'Friend'){
       return 'user-friends'
    }
}
const routeNameChange = (routeName) => {
    if(routeName === 'Home'){
       return '홈'
    }else if(routeName === 'Somoim'){
        return '소모임'
    }else if(routeName === 'Chat'){
       return '채팅'
    }else if(routeName === 'Board'){
       return '게시판'
    }else if(routeName === 'Friend'){
       return 'My 친구'
    }
};
class MainTab extends Component {
    render(){
        return(
            <Tab.Navigator screenOptions={({route}) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => {
                    return (
                        <FontAwesome5 name={iconNameChange(route.name)} size={24} color={focused ? focusedColor : unfocusedColor }
                        />
                    )
                },
                tabBarLabel: ({ focused }) => {
                    return <Text style={{color :focused ? focusedColor : unfocusedColor }}>{routeNameChange(route.name)}</Text>
                },
                tabBarStyle: {
                    backgroundColor: tabBarBackgroundColor,
                    borderTopColor: tabBarBackgroundColor
                }
            })}>
                <Tab.Screen name="Home" component={Home}/>
                <Tab.Screen name="Somoim" component={Somoim}/>
                <Tab.Screen name="Chat" component={Chat}/>
                <Tab.Screen name="Board" component={Board}/>
                <Tab.Screen name="Friend" component={Friend}/>
            </Tab.Navigator>
        )
    }
}

export default MainTab;