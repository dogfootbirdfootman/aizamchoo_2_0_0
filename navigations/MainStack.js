import React, { Component } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTab from './MainTab';
import MainHeader from '../components/MainHeader';

import MyPage from '../screens/MyPage';
import Shop from '../screens/Shop';
import Bell from '../screens/Bell';
import Setting from '../screens/Setting';
import MyInfo from '../screens/MyInfo';
import Choice from '../screens/Choice';
import Write from '../screens/Write';
import MyIdeal from '../screens/MyIdeal';
import IdealChoice from '../screens/IdealChoice';
import SogaetingRoomDrawerNavi from './SogaetingRoomDrawerNavi';
import PlazaRoomDrawerNavi from './PlazaRoomDrawerNavi';
import MeetingRoomDrawerNavi from './MeetingRoomDrawerNavi';
import KingGameRoomDrawerNavi from './KingGameRoomDrawerNavi';
import BlindProfileDrawerNavi from './BlindProfileDrawerNavi';
import SomoimMake from '../screens/SomoimMake';
import SomoimPageTopTab from './SomoimPageTopTab';
import SomoimEdit from '../screens/SomiomEdit';
import SomoimBoardWrite from '../screens/SomoimBoardWrite';
import SomoimBoardUpdate from '../screens/SomoimBoardUpdate';
import YourPage from '../screens/YourPage';
import PostInBoard from '../screens/PostInBoard';

import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

class MainStack extends Component {
    render(){
        return(
            <Stack.Navigator>
                <Stack.Screen name="MainTab" component={MainTab} options={{
                    header: (props) => <MainHeader {...props} 
                        title="Ai 쟈만츄" 
                        leftItems={[
                            {icon: <MaterialIcons name="menu" size={40} color="white" />, goal: 'MyPage'}
                        ]}
                        rightItems={[
                            {icon: <Fontisto name="shopping-store" size={28} color="white" />, goal: 'Shop'},
                            {icon: <FontAwesome5 name="bell" size={30} color="white"/>, goal: 'Bell'}
                        ]}
                    />
                }}/>
                <Stack.Screen name="MyPage" component={MyPage} options={{
                    header: (props) => <MainHeader {...props} 
                        title="마이페이지" 
                        leftItems={[
                            {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                        ]}
                        rightItems={[
                            {icon: <MaterialIcons name="settings" size={30} color="white" />, goal: 'Setting'}
                        ]}
                    />
                }}/>
                <Stack.Screen name="Shop" component={Shop}/>
                <Stack.Screen name="Bell" component={Bell}/>
                <Stack.Screen name="Setting" component={Setting}/>
                <Stack.Screen name="MyInfo" component={MyInfo} options={{
                    header: (props) => <MainHeader {...props} 
                        title="나의 정보" 
                        leftItems={[
                            {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                        ]}
                        rightItems={[]}
                    />
                }}/>
                <Stack.Screen name="Choice" component={Choice} options={{
                    header: (props) => <MainHeader {...props} 
                        title={props.route.params.title}
                        leftItems={[
                            {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                        ]}
                        rightItems={[]}
                    />
                }}/>
                <Stack.Screen name="Write" component={Write} options={{
                    header: (props) => <MainHeader {...props} 
                        title={props.route.params.title}
                        leftItems={[
                            {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                        ]}
                        rightItems={[]}
                    />
                }}/>
                <Stack.Screen name="MyIdeal" component={MyIdeal} options={{
                    header: (props) => <MainHeader {...props} 
                        title="나의 이상형" 
                        leftItems={[
                            {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                        ]}
                        rightItems={[]}
                    />
                }}/>
                <Stack.Screen name="IdealChoice" component={IdealChoice} options={{
                    header: (props) => <MainHeader {...props} 
                        title={"나의 이상형 ( " + props.route.params.title + " )"}
                        leftItems={[
                            {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                        ]}
                        rightItems={[]}
                    />
                }}/>
                <Stack.Screen name="SogaetingRoomDrawerNavi" component={SogaetingRoomDrawerNavi} options={{
                    headerShown: false
                }}/>
                <Stack.Screen name="PlazaRoomDrawerNavi" component={PlazaRoomDrawerNavi} options={{
                    headerShown: false
                }}/>
                <Stack.Screen name="MeetingRoomDrawerNavi" component={MeetingRoomDrawerNavi} options={{
                    headerShown: false
                }}/>
                <Stack.Screen name="KingGameRoomDrawerNavi" component={KingGameRoomDrawerNavi} options={{
                    headerShown: false
                }}/>
                <Stack.Screen name="BlindProfileDrawerNavi" component={BlindProfileDrawerNavi} options={{
                    headerShown: false
                }}/>
                <Stack.Screen name="YourPage" component={YourPage} options={{
                    header: (props) => <MainHeader {...props} 
                        title={props.route.params.nick_open === 0 ? props.route.params.nick + " 님의 프로필" : "? 님의 프로필"}
                        leftItems={[
                            {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                        ]}
                        rightItems={[]}
                    />
                }}/>
                <Stack.Screen name="SomoimMake" component={SomoimMake} options={{
                    // header: (props) => <MainHeader {...props} 
                    //     title="모임 개설"
                    //     leftItems={[
                    //         {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                    //     ]}
                    //     rightItems={[]}
                    // />
                    title: "모임 개설"
                }}/>
                <Stack.Screen name="SomoimPageTopTab" component={SomoimPageTopTab} options={({route}) => (
                    {title: route.params.somoim.name}
                )}/>
                <Stack.Screen name="SomoimEdit" component={SomoimEdit} options={{
                    // header: (props) => <MainHeader {...props} 
                    //     title="모임 개설"
                    //     leftItems={[
                    //         {icon: <MaterialIcons name="arrow-back" size={30} color="white" />, goal: 'back'}
                    //     ]}
                    //     rightItems={[]}
                    // />
                    title: "모임 수정"
                }}/>
                <Stack.Screen name="SomoimBoardWrite" component={SomoimBoardWrite} options={({route}) => (
                    {title: route.params.somoim.name}
                )}/>
                <Stack.Screen name="SomoimBoardUpdate" component={SomoimBoardUpdate} options={({route}) => (
                    {title: "게시글 수정하기"}
                )}/>
                <Stack.Screen name="PostInBoard" component={PostInBoard} options={{title:"게시글"}}/>
            </Stack.Navigator>
        )
    }
}

export default MainStack;
