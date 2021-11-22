import React, { Component } from 'react';
import { Image, StatusBar } from 'react-native';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';

import store from './store';

import MainStack from './navigations/MainStack';
import MainDoor from './screens/MainDoor';

import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const cacheImages = (images) => images.map(image => {
    if(typeof image === 'string'){
        return Image.prefetch(image);
    }else{
        return Asset.fromModule(image).downloadAsync();
    }
});

const cacheFonts = (fonts) => fonts.map(font => Font.loadAsync(font));

class App extends Component {
    state = {
        isReady: false,
        isLoggedIn: false
    }
    loadAssets = () => {
        const images = cacheImages([]);
        const fonts = cacheFonts([
            MaterialIcons.font,
            FontAwesome5.font,
            Fontisto.font,
            AntDesign.font,
            MaterialCommunityIcons.font
        ]);
        return Promise.all([...images, ...fonts]);
    }
    onFinish = () => {
        this.setState({
            isReady: true
        })
    }
    isLoggedIn = () => {
        const user = store.getState().user;
        if(user){
            this.setState({
                isLoggedIn: true
            })
        }else{
            this.setState({
                isLoggedIn: false
            })
        }
    }
    componentDidMount(){
        this.unsubscribe = store.subscribe(this.isLoggedIn)
    }
    componentWillUnmount(){
        this.unsubscribe()
    }
    render(){
        return(
            this.state.isReady ? 
                this.state.isLoggedIn ? 
                    <>  
                        <StatusBar barStyle='light-content' backgroundColor="black"/>
                        <NavigationContainer>
                            <MainStack />
                        </NavigationContainer>
                    </>
                :
                    <>
                        <StatusBar barStyle='light-content' backgroundColor="black"/>
                        <MainDoor />
                    </>
            : 
                <AppLoading startAsync={this.loadAssets} onFinish={this.onFinish} onError={console.error}/>
        )
    }
}

export default App;