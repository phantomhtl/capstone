import { useReducer, useEffect } from "react";
import { validate } from "../../util/validators";
import "./Input.css";

// Input state reducer
const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH":
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

const Input = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput, element: inputElement, type, placeholder, label, rows, errorText, validators } = props;
  const { value, isValid, isTouched } = inputState;

  // Effect to call onInput whenever input state changes
  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  // Change handler for input value
  const changeHandler = (event) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators,
    });
  };

  // Touch handler to mark the input as touched
  const touchHandler = () => {
    dispatch({ type: "TOUCH" });
  };

  // Render input or textarea based on the props
  const renderedElement = inputElement === "input" ? (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      onChange={changeHandler}
      onBlur={touchHandler}
      value={inputState.value}
    />
  ) : (
    <textarea
      id={id}
      rows={rows || 3}
      onChange={changeHandler}
      onBlur={touchHandler}
      value={inputState.value}
    />
  );

  return (
    <div className={`form-control ${!isValid && isTouched && "form-control--invalid"}`}>
      <label htmlFor={id}>{label}</label>
      {renderedElement}
      {!isValid && isTouched && <p>{errorText}</p>}
    </div>
  );
};

export default Input;
