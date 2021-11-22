import React, { Component } from 'react';
import Login from '../components/Login';
import JoinUs from '../components/JoinUs';

class MainDoor extends Component {
    state = {
        page: 'Login'
    }
    changePage = page => {
        this.setState({
            page
        })
    }
    page = {
        'Login' : <Login changePage={this.changePage}/>,
        'JoinUs' : <JoinUs changePage={this.changePage}/>
    }
    render(){
        return(
                this.page[this.state.page]
        )
    }
}

export default MainDoor;
