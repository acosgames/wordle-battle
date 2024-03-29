import React, { useEffect, useRef, useReducer } from "react";

function doSubmit(submittedValues) {
    console.log(`Submitted: ${submittedValues.join("")}`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1500);
    });
}

function clampIndex(index) {
    if (index > 5) {
        return 5;
    } else if (index < 0) {
        return 0;
    } else {
        return index;
    }
}

function reducer(state, action) {
    switch (action.type) {
        case "INPUT":
            return {
                ...state,
                inputValues: [
                    ...state.inputValues.slice(0, action.payload.index),
                    action.payload.value,
                    ...state.inputValues.slice(action.payload.index + 1)
                ],
                focusedIndex: clampIndex(state.focusedIndex + 1)
            };

        case "BACK":
            return {
                ...state,
                focusedIndex: clampIndex(state.focusedIndex - 1)
            };

        case "PASTE":
            return {
                ...state,
                inputValues: state.inputValues.map(
                    (_, index) => action.payload.pastedValue[index] || ""
                )
            };

        case "FOCUS":
            return {
                ...state,
                focusedIndex: action.payload.focusedIndex
            };

        case "VERIFY":
            return {
                ...state,
                status: "pending"
            };

        case "VERIFY_SUCCESS":
            return {
                ...state,
                status: "idle"
            };

        default:
            throw new Error("unknown action");
    }
}

const initialState = {
    inputValues: Array(5).fill(""),
    focusedIndex: 0,
    status: "idle"
};

export default function WordInput(props) {
    const [{ inputValues, focusedIndex, status }, dispatch] = useReducer(
        reducer,
        initialState
    );
    // console.log(focusedIndex);

    function handleInput(index, value) {
        if (props.onChange)
            props.onChange(inputValues.join('') + value);
        dispatch({ type: "INPUT", payload: { index, value } });
    }

    function handleBack() {
        dispatch({ type: "BACK" });
    }

    function handlePaste(pastedValue) {
        dispatch({ type: "PASTE", payload: { pastedValue } });

        if (pastedValue.length === 5) {
            dispatch({ type: "VERIFY" });
            doSubmit(pastedValue.split("")).then(() =>
                dispatch({ type: "VERIFY_SUCCESS" })
            );
        }
    }

    function handleFocus(focusedIndex) {
        dispatch({ type: "FOCUS", payload: { focusedIndex } });
    }

    function handleSubmit(e) {
        e.preventDefault();

        dispatch({ type: "VERIFY" });
        doSubmit(inputValues).then(() => dispatch({ type: "VERIFY_SUCCESS" }));
    }

    return (
        <div className="squares">
            {inputValues.map((value, index) => {
                return (
                    <Input
                        key={index}
                        index={index}
                        value={value}
                        onChange={handleInput}
                        onBackspace={handleBack}
                        onPaste={handlePaste}
                        isFocused={index === focusedIndex}
                        onFocus={handleFocus}
                        isDisabled={status === "pending"}
                    />
                );
            })}
        </div>
    );
}

function Input({
    index,
    value,
    onChange,
    onPaste,
    onBackspace,
    isFocused,
    onFocus,
    isDisabled
}) {
    const ref = useRef();
    useEffect(() => {
        requestAnimationFrame(() => {
            // console.log(
            //   ref.current,
            //   document.activeElement,
            //   ref.current !== document.activeElement
            // );
            // if (ref.current !== document.activeElement && isFocused) {
            //     ref.current.focus();
            // }
        });
    }, [isFocused]);

    function handleChange(e) {
        onChange(index, e.target.value);
    }

    function handlePaste(e) {
        onPaste(e.clipboardData.getData("text"));
    }

    function handleKeyDown(e) {
        if (e.key === "Backspace") {
            onBackspace();
        }
    }

    function handleFocus(e) {
        e.target.setSelectionRange(0, 1);
        onFocus(index);
    }

    return (
        <input
            className={'square'}
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            maxLength="1"
            onFocus={handleFocus}
            disabled={isDisabled}
        />
    );
}