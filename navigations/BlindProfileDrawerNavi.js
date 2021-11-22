import React, { Component } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BlindProfile from '../screens/BlindProfile';
import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
// import RoomDrawer from '../components/RoomDrawer';
import { roomStatusText } from '../dbs';
import fb from '../fb';

const db = fb.firestore();

const Drawer = createDrawerNavigator();

class BlindProfileDrawerNavi extends Component {
    state = {
        room: this.props.route.params.roomData
    }
    componentDidMount(){
        // room ( 이 방 ) 구독 
        this.unsubscribeRoomDataUpdate = db.doc(`rooms/${this.props.route.params.roomId}`).onSnapshot((documentSnapshot) => {
            const room = documentSnapshot.data();
            this.setState({room});
        })
    }
    componentWillUnmount(){
        this.unsubscribeRoomDataUpdate()
    }
    render(){
        return (
            <Drawer.Navigator 
                initialRouteName="BlindProfile" 
                // drawerContent={props => <RoomDrawer {...props}/>}
                screenOptions={({navigation}) => (
                    {
                        // headerRight: () => <MaterialIcons name="menu" size={40} color="black" style={{marginRight: 10}} onPress={() => navigation.toggleDrawer()}/>,
                        // drawerPosition: 'right',
                        headerLeft: () => <MaterialIcons name="arrow-back" size={30} color="black" style={{marginLeft: 10}} onPress={() => navigation.goBack()}/>,
                        headerTitleAlign: 'center',
                        drawerStyle: {
                            width: Dimensions.get('window').width * 8 / 10
                        }
                        
                    }
                )}
            >
                <Drawer.Screen 
                    name="BlindProfile" 
                    component={BlindProfile} 
                    initialParams={this.props.route.params} 
                    options={{
                        title: "블라인드 프로필 ( " +  roomStatusText[this.state.room.status] + " )"
                    }}
                />
            </Drawer.Navigator>
      );
    }
}

export default BlindProfileDrawerNavi;