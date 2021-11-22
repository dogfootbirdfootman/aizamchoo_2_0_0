import React, { Component } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import PlazaRoom from '../screens/PlazaRoom';
import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import RoomDrawer from '../components/RoomDrawer';

const Drawer = createDrawerNavigator();

class PlazaRoomDrawerNavi extends Component {
    render(){
        return (
            <Drawer.Navigator 
                initialRouteName="PlazaRoom" 
                drawerContent={props => <RoomDrawer {...props}/>}
                screenOptions={({navigation}) => (
                    {
                        headerRight: () => <MaterialIcons name="menu" size={40} color="black" style={{marginRight: 10}} onPress={() => navigation.toggleDrawer()}/>,
                        drawerPosition: 'right',
                        headerLeft: () => <MaterialIcons name="arrow-back" size={30} color="black" style={{marginLeft: 10}} onPress={() => navigation.goBack()}/>,
                        headerTitleAlign: 'center',
                        drawerStyle: {
                            width: Dimensions.get('window').width * 8 / 10
                        }
                        
                    }
                )}
            >
                <Drawer.Screen 
                    name="PlazaRoom" 
                    component={PlazaRoom} 
                    initialParams={this.props.route.params} 
                    options={{
                        title: "광장"
                    }}
                />
            </Drawer.Navigator>
      );
    }
}

export default PlazaRoomDrawerNavi;