import React, { Component } from 'react';
import {connect} from 'react-redux';

class App extends Component {
  render(){
    const {ctr}= this.props;
    return (
      <div className="App">
        <button onClick = {this.props.onIncrementCounter}>increment by one</button>
        <button onClick = {this.props.onDecrementCounter}>decrement by one</button>
        {ctr}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { ctr: state.counter }; //state is the reducers
}

const mapDispatchToProps = dispatch =>{
  return {
    onIncrementCounter: ()=> dispatch({type: "INCREMENT"}),
    onDecrementCounter: ()=> dispatch({type: "DECREMENT"})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
