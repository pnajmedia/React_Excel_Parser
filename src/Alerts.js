
import React,{ Component } from "react";

class Alerts extends React.Component{

    constructor(props){
        super(props);
        this.state = {msgEnabled:''}
    }
    componentDidMount=() =>{
        this.setState({msgEnabled:this.props})
    }

    render(){
     
        return(
         this.state.msgEnabled?
                <div className={`alert alert-${this.props.msgStatus}`}> {this.props.msg}</div>:<div></div>
        )
    }
}

export default Alerts;