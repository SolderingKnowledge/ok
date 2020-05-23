const initState = {
    counter:0
}
const rootReducer = (state=initState, action)=>{
    if(action.type === "INCREMENT"){
        return{ counter: state.counter += 1}
    }
    if(action.type === "DECREMENT"){
        if(state.counter > 0 ){
            return{ counter: state.counter -= 1}
        }
    }
    return state;
}

export default rootReducer;