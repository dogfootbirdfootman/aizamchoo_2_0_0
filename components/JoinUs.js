import React, { Component } from 'react';
import { View, StyleSheet, TextInput, Dimensions, Text, TouchableOpacity, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addressDB, heightCentimeterDB, jobDB, schoolDB, religionDB } from '../dbs';
import fb from '../fb';

const auth = fb.auth();
const db = fb.firestore();
const errorMessage = {
    'auth/email-already-in-use': '이미 가입되어 있는 이메일 주소입니다.',
    'auth/invalid-email': '이메일 주소 형식이 틀렸습니다.',
    'auth/operation-not-allowed': '사용이 중지된 계정입니다.',
    'auth/weak-password': '현재 입력된 비밀번호는 보안에 취약합니다. 다시 입력해주세요'
}
class JoinUs extends Component {
    state = {
        email: '',
        password: '',
        passwordConfirm: '',
        nick: '',
        job: jobDB[0],
        school: schoolDB[0],
        address_0: '서울특별시',
        address_1: '강남구',
        heightCentimeter: heightCentimeterDB[0],
        religion: religionDB[0],
        sex: "여성",
        age: new Date(1990,0,1),
        licenseNumber: '',
        message: '',
        page: 0,
        dateTimePickerShown: false,
        keyboardisOpened: false,
        alertColor: 'red',
        loading: false
    }
    componentDidMount(){
        Keyboard.addListener('keyboardDidShow', () => {
            this.setState({keyboardisOpened: true})
        })
        Keyboard.addListener('keyboardDidHide', () => {
            this.setState({keyboardisOpened: false})
        })
    }
    componentWillUnmount(){
        Keyboard.removeAllListeners('keyboardDidShow');
        Keyboard.removeAllListeners('keyboardDidHide');
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
    onChangePasswordConfirm = (passwordConfirm) => {
        this.setState({
            passwordConfirm
        }, () => {
            if(this.state.password === this.state.passwordConfirm) {
                this.setState({
                    message: "비밀번호와 비밀번호 확인이 일치합니다.",
                    alertColor: 'green'
                })
            }else{
                this.setState({
                    message: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
                    alertColor: 'red'
                })
            }
        })
    }
    onChangeNick = (nick) => {
        this.setState({
            nick
        })
    }
    onChangeLicenseNumber = (licenseNumber) => {
        this.setState({
            licenseNumber
        })
    }
    login = () => {
        this.props.changePage('Login')
    }
    joinUs = () => {
        const { email, password, passwordConfirm, nick, job, school, address_0, address_1, heightCentimeter, religion, sex, age, licenseNumber } = this.state;
        if(email === '' || password === '' || nick === ''){
            this.setState({
                message: '빈 칸 없이 입력해주세요.',
                alertColor: 'red',
                loading: false
            })
        }else{
            if(password === passwordConfirm){
                auth.createUserWithEmailAndPassword( email, password )
                .then((userCredential) => {
                    const user = {
                        uid: userCredential.user.uid,
                        nick,
                        job,
                        school,
                        address_0,
                        address_1,
                        heightCentimeter,
                        religion,
                        sex,
                        age,
                        licenseNumber,
                        status: 'ok',

                        profilePhotoUrl: null,
                        earnPerYear: null,
                        family: null,
                        hobby: [],
                        drink: null,
                        smoke: null,
                        character: [],
                        bodyForm: null,
                        style: null,
                        question: [],

                        job_y: [],
                        school_y: 0,
                        age_y: [20, 50],
                        height_y: [140, 200],
                        address_y: [],
                        religion_y: [],
                        earnPerYear_y: [0],
                        hobby_y: [],
                        drink_y: 0,
                        smoke_y: 0,
                        bodyForm_y: [],
                        character_y: [],
                        style_y: [],

                        roomId: "",
                        memberId: "",

                        job_open: 0,
                        school_open: 0,
                        age_open: 0,
                        address_open: 0,
                        heightCentimeter_open: 0,
                        licenseNumber_open: 0,
                        nick_open: 0,
                        profilePhotoUrl_open: 0,
                        religion_open: 0,
                        earnPerYear_open: 0,
                        family_open: 0,
                        hobby_open: 0,
                        drink_open: 0,
                        smoke_open: 0,
                        character_open: 0,
                        bodyForm_open: 0,
                        style_open: 0,
                        question_open: 0,

                        friends: [],
                        point: 0,
                        inviteBlind: ''
                    };
                    db.collection('users').doc(user.uid).set(user)
                    .then((documentReference) => {
                        Keyboard.dismiss()
                        this.setState({
                            email: '',
                            password: '',
                            nick: '',
                            passwordConfirm: '',
                            message: "회원가입에 성공하였습니다. 로그인 페이지로 이동합니다.",
                            alertColor: 'blue'
                        }, () => setTimeout(this.login, 1000))
                    })
                    .catch(error => console.error(error))
                })
                .catch((error) => {
                    this.setState({
                        message: errorMessage[error.code],
                        alertColor: 'red',
                        loading: false
                    })
                })
            }else{
                this.setState({
                    message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
                    alertColor: 'red',
                    loading: false
                })
            }
        }
    }
    onChangeDateTimePicker = (event, selectedDate) => {
        const currentDate = selectedDate || this.state.age;
        if(event.type === 'set'){
            this.setState({
                age: currentDate,
                dateTimePickerShown: false
            })
        }else if(event.type === 'dismissed'){
            this.setState({
                dateTimePickerShown: false,
            })
        }
    }
    openDatePicker = () => {
        this.setState({
            dateTimePickerShown: true
        })
    }
    changePage = (index) => {
        if(index === 1) {
            const { licenseNumber } = this.state;
            if(licenseNumber === ''){
                this.setState({
                    message: "면허번호를 입력해주세요.",
                    alertColor: 'red'
                })
            }else {
                this.setState({
                    page: index,
                    message: '',
                    alertColor: 'red'
                })
            }
        }else if(index === 0){
            this.setState({
                page: index,
                message: '',
                alertColor: 'red'
            })
        }
    }
    page = (index) => {
        if(index === 0){
            return (
                <View style={[styles.infoContainer, {justifyContent: this.state.keyboardisOpened ? 'flex-start': 'center'}]}>
                    {this.state.keyboardisOpened ? 
                        null : 
                        <View style={styles.infoTitleContainer}>
                            <Text style={styles.infoTitleOne}>
                                기본정보 입력
                            </Text>
                            <Text style={styles.infoTitleTwo}>
                                정확한 프로필 정보를 입력해주세요.
                            </Text>
                        </View>
                    }
                    <View style={styles.infoInputContainer}>
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                직업 :
                            </Text>
                            <Picker 
                                dropdownIconColor="gray"
                                selectedValue={this.state.job}
                                style={styles.infoPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({job: itemValue});
                                }}>
                                {jobDB.map((job, index) => {
                                    return(
                                        <Picker.Item label={job} value={job} key={job+index} />
                                    )
                                })}
                            </Picker>
                        </View>
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                학교 :
                            </Text>
                            <Picker 
                                dropdownIconColor="gray"
                                selectedValue={this.state.school}
                                style={styles.infoPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({school: itemValue});
                                }}>
                                {schoolDB.map((school, index) => {
                                    return(
                                        <Picker.Item label={school} value={school} key={school+index} />
                                    )
                                })}
                            </Picker>
                        </View>
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                지역 :
                            </Text>
                            <Picker
                                dropdownIconColor="gray"
                                selectedValue={this.state.address_0}
                                style={styles.infoPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({address_0: itemValue, address_1: addressDB[itemValue][0]});
                                }}>
                                {Object.keys(addressDB).map((v,i) => {
                                    return <Picker.Item label={v} value={v} key={i+v}/>
                                })}
                            </Picker>
                        </View>
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                
                            </Text>
                            <Picker 
                                dropdownIconColor="gray"
                                selectedValue={this.state.address_1}
                                style={styles.infoPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({address_1: itemValue});
                                }}>
                                {addressDB[this.state.address_0].map((v,i) => {
                                    return <Picker.Item label={v} value={v} key={i+v}/>
                                })}
                            </Picker>
                        </View>
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                키 :
                            </Text>
                            <Picker
                                dropdownIconColor="gray"
                                selectedValue={this.state.heightCentimeter}
                                style={styles.infoPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({heightCentimeter: itemValue});
                                }}>
                                {heightCentimeterDB.map((height, index) => {
                                    return(
                                        <Picker.Item label={height} value={height} key={height+index} />
                                    )
                                })}
                            </Picker>
                        </View>
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                종교 :
                            </Text>
                            <Picker 
                                dropdownIconColor="gray"
                                selectedValue={this.state.religion}
                                style={styles.infoPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({religion: itemValue});
                                }}>
                                {religionDB.map((religion, index) => {
                                    return(
                                        <Picker.Item label={religion} value={religion} key={religion+index} />
                                    )
                                })}
                            </Picker>
                        </View>
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                성별 :
                            </Text>
                            <Picker 
                                dropdownIconColor="gray"
                                selectedValue={this.state.sex}
                                style={styles.infoPicker}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({sex: itemValue});
                                }}>
                                {["여성", "남성"].map((sex, index) => {
                                    return(
                                        <Picker.Item label={sex} value={sex} key={sex+index} />
                                    )
                                })}
                            </Picker>
                        </View>
                        <TouchableOpacity style={styles.infoLabelAndPickerContainer} onPress={this.openDatePicker}>
                            <Text style={styles.infoLabelText}>
                                생일 :
                            </Text>
                            <Text style={styles.infoAgeText}>
                               {this.state.age.getFullYear()} 년 {this.state.age.getMonth() + 1} 월 {this.state.age.getDate()} 일
                            </Text>
                        </TouchableOpacity>
                        {this.state.dateTimePickerShown && 
                            <DateTimePicker 
                                value={this.state.age}
                                mode="date"
                                display="default"
                                maximumDate={new Date(2012, 11, 31)}
                                minimumDate={new Date(1950, 0, 1)}
                                onChange={this.onChangeDateTimePicker}
                            />
                        }
                        <View style={styles.infoLabelAndPickerContainer}>
                            <Text style={styles.infoLabelText}>
                                면허번호 :
                            </Text>
                            <TextInput
                                style={styles.infoTextInput}
                                onChangeText={licenseNumber => this.onChangeLicenseNumber(licenseNumber)}
                                value={this.state.licenseNumber}
                                autoCompleteType="off"
                                autoCorrect={false}
                                maxLength={10}
                                placeholderTextColor="darkgray"
                                textAlign="center"
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>
                    <View  style={styles.messageContainer}>
                        <Text style={[styles.messageText, {color: this.state.alertColor}]}>
                            {this.state.message}
                        </Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.joinUsButton} onPress={() => this.changePage(1)}>
                            <Text style={styles.joinUsButtonText}>
                                계속...
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginButton} onPress={this.login}>
                            <Text style={styles.loginButtonText}>
                                뒤로...
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }else if(index === 1){
            return (
                <View style={[styles.container, {justifyContent: this.state.keyboardisOpened ? 'flex-start': 'center'}]}>
                        {this.state.keyboardisOpened ? 
                            null
                        : 
                            <View style={styles.titleContainer}>
                                <Text style={styles.titleText}>
                                    계정정보 입력
                                </Text>
                            </View>
                        }
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
                            <TextInput
                                style={styles.passwordTextConfirmInput}
                                onChangeText={password => this.onChangePasswordConfirm(password)}
                                value={this.state.passwordConfirm}
                                autoCompleteType="password"
                                autoCorrect={false}
                                maxLength={50}
                                placeholder="비밀번호 확인"
                                placeholderTextColor="darkgray"
                                keyboardType="default"
                                secureTextEntry={true}
                                textAlign="left"
                            />
                            <TextInput
                                style={styles.nickTextinput}
                                onChangeText={nick => this.onChangeNick(nick)}
                                value={this.state.nick}
                                autoCompleteType="name"
                                autoCorrect={false}
                                maxLength={50}
                                placeholder="닉네임"
                                placeholderTextColor="darkgray"
                                keyboardType="default"
                                textAlign="left"
                            />
                        </View>
                        <View  style={styles.messageContainer}>
                            <Text style={[styles.messageText, {color: this.state.alertColor}]}>
                                {this.state.message}
                            </Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            {this.state.loading ? 
                                <View style={styles.joinUsButton}>
                                    <Text style={styles.joinUsButtonText}>
                                        회원가입 하는중...
                                    </Text>
                                </View>
                            :
                                <TouchableOpacity 
                                    style={styles.joinUsButton} 
                                    onPress={() => this.setState({loading: true}, () => this.joinUs())}>
                                    <Text style={styles.joinUsButtonText}>
                                        회원가입
                                    </Text>
                                </TouchableOpacity>
                            }
                            
                            <TouchableOpacity style={styles.joinUsButton} onPress={() => this.changePage(0)}>
                                <Text style={styles.joinUsButtonText}>
                                    뒤로...
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.loginButton} onPress={this.login}>
                                <Text style={styles.loginButtonText}>
                                    로그인 하러가기
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            )
        }
    }
    render(){
        return(
            this.page(this.state.page)
        )
    }
}
const styles = StyleSheet.create({
    infoContainer: {
        flex: 1,
        alignItems: 'center'
    },
    infoTitleContainer: {
        alignItems: 'center'
    },
    infoTitleOne: {
        fontSize: 30,
        marginBottom: 10
    },
    infoTitleTwo: {
        fontSize: 20,
        color: "red",
        marginBottom: 30
    },
    infoInputContainer: {
        marginBottom: 20
    },
    infoLabelAndPickerContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: "silver",
        width: Dimensions.get('window').width * 10 /20,
        height: Dimensions.get('window').height * 1 / 20,
        alignItems: "center",
        justifyContent: "space-between"
    },
    infoLabelText: {
        fontSize: 20
    },
    infoPicker: {
        height: 50,
        width: Dimensions.get('window').width/3,
    },
    infoAgeText: {
        fontSize: 18
    },
    infoTextInput: {
        width: Dimensions.get('window').width/3,
        fontSize: 20
    },
    container: {
        flex: 1,
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
        height: Dimensions.get('window').height * 1 / 20,
        borderColor: 'gray',
        borderWidth: 1 ,
        paddingLeft: 10,
        fontSize: 16,
        margin: 5
    },
    passwordTextinput: {
        width: Dimensions.get('window').width * 10 /20,
        height: Dimensions.get('window').height * 1 / 20,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 10,
        fontSize: 16,
        margin: 5
    },
    passwordTextConfirmInput: {
        width: Dimensions.get('window').width * 10 /20,
        height: Dimensions.get('window').height * 1 / 20,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 10,
        fontSize: 16,
        margin: 5
    },
    nickTextinput: {
        width: Dimensions.get('window').width * 10 /20,
        height: Dimensions.get('window').height * 1 / 20,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 10,
        fontSize: 16,
        margin: 5
    },
    joinUsButton: {
        width: Dimensions.get('window').width * 10 /20,
        height: Dimensions.get('window').height * 1 / 20,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5
    },
    joinUsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    loginButton: {
        width: Dimensions.get('window').width * 10 /20,
        height: Dimensions.get('window').height * 1 / 20,
        backgroundColor: 'darkgray',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    messageContainer: {
        width: Dimensions.get('window').width * 10 /20,
    },
    messageText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    }
})
export default JoinUs;