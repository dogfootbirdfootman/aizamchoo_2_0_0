import React, { Component } from 'react';
import { View, StyleSheet, TextInput, Dimensions, Text, TouchableOpacity } from 'react-native';
import store from '../store';
import fb from '../fb';
const auth = fb.auth();
const db = fb.firestore();
const errorMessage = {
    'auth/invalid-email': '이메일 주소 형식이 틀렸습니다.',
    'auth/user-disabled': '사용이 중지된 계정입니다.',
    'auth/user-not-found': '해당 이메일로 가입된 사용자가 없습니다.',
    'auth/wrong-password': '비밀번호가 틀렸습니다. 다시 입력해주세요.'
}
class Login extends Component {
    state = {
        email: '',
        password: '',
        message: '',
        loading: false
    }
    onChangeEmail = (email) => {
        this.setState({
            email
        })
    }
    onChangePassword = (password) => {
        this.setState({
            password
        })
    }
    login = () => {
        const { email, password } = this.state;
        if(email === '' || password === ''){
            this.setState({
                message: '빈 칸 없이 입력해주세요.',
                loading: false
            })
        }else{
            auth.signInWithEmailAndPassword( email, password )
            .then((userCredential) => {
                const uid = userCredential.user.uid;
                db.collection('users').where('uid', '==', uid).where('status', '==', 'ok').get()
                .then((querySnapshot) => {
                    if(querySnapshot.empty){
                        this.setState({
                            message: errorMessage['auth/user-disabled'],
                            loading: false
                        })
                    }else{
                        const profile = querySnapshot.docs[0].data();
                        const docId = querySnapshot.docs[0].id;
                        store.dispatch({ type: 'user', user: {...profile, docId: docId} });
                    }
                })
                .catch(error => console.error(error))
            })
            .catch((error) => {
                this.setState({
                    message: errorMessage[error.code],
                    loading: false
                })
            })
        }
    }
    joinUs = () => {
        this.props.changePage('JoinUs')
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>
                        Ai 쟈만츄
                    </Text>
                </View>
                <View style={styles.textInputContainer}>
                    <TextInput
                        style={styles.emailTextInput}
                        onChangeText={email => this.onChangeEmail(email)}
                        value={this.state.email}
                        autoCompleteType="email"
                        autoCorrect={false}
                        maxLength={50}
                        placeholder="이메일"
                        placeholderTextColor="darkgray"
                        keyboardType="email-address"
                        textAlign="left"
                    />
                    <TextInput
                        style={styles.passwordTextinput}
                        onChangeText={password => this.onChangePassword(password)}
                        value={this.state.password}
                        autoCompleteType="password"
                        autoCorrect={false}
                        maxLength={50}
                        placeholder="비밀번호"
                        placeholderTextColor="darkgray"
                        keyboardType="default"
                        secureTextEntry={true}
                        textAlign="left"
                    />
                </View>
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>
                        {this.state.message}
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    {this.state.loading ? 
                        <View style={styles.loginButton}>
                            <Text style={styles.loginButtonText}>
                                로그인 하는중...
                            </Text>
                        </View>
                    : 
                        <TouchableOpacity style={styles.loginButton} onPress={() => this.setState({loading: true}, () => this.login())}>
                            <Text style={styles.loginButtonText}>
                                로그인
                            </Text>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity style={styles.joinUsButton} onPress={this.joinUs}>
                        <Text style={styles.joinUsButtonText}>
                            회원가입 하러가기
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleContainer: {
        marginBottom: 30
    },
    titleText: {
        fontSize: 30
    },
    textInputContainer: {
        marginBottom: 20
    },
    emailTextInput: { 
        width: Dimensions.get('window').width * 10 /20,
        borderColor: 'gray',
        borderWidth: 1 ,
        paddingLeft: 10,
        paddingVertical: 5,
        fontSize: 16,
        marginBottom: 5
    },
    passwordTextinput: {
        width: Dimensions.get('window').width * 10 /20,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 10,
        paddingVertical: 5,
        fontSize: 16
    },
    loginButton: {
        width: Dimensions.get('window').width * 10 /20,
        backgroundColor: 'darkgray',
        marginBottom: 5,
        paddingVertical: 10
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    joinUsButton: {
        width: Dimensions.get('window').width * 10 /20,
        backgroundColor: 'gray',
        paddingVertical: 10
    },
    joinUsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    messageContainer: {
        width: Dimensions.get('window').width * 10 /20,
        marginBottom: 5
    },
    messageText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    }
})
export default Login;