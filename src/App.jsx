import { useEffect, useRef, useState } from 'react'
import './App.scss'

function App() {
  const [isLoading,data] = useFetch(`http://localhost:3000/todo`)
  const [todo, setTodo] = useState([])
  const [currentTodo,setCurrentTodo] = useState(null)
  const [time, setTime] = useState(0)
  const [isTimer, setIsTimer] = useState(false)

  useEffect(()=>{
    if(currentTodo){
      fetch(`http://localhost:3000/todo/${currentTodo}`,{
        method:"PATCH",
        body: JSON.stringify({
          time: todo.find((el)=>
            el.id === currentTodo).time + 1,
        }),
      })
      .then(res => res.json())
      .then((res) => 
        setTodo((prev) =>
           prev.map((el)=>(el.id ===
          currentTodo ? res : el))
      )
    )
    }
  },[time])


  useEffect(() => {setTime(0)},[isTimer])


  useEffect(() => {
    if(data) setTodo(data)
  }, [isLoading])
  return (
    <>
    <button onClick={()=> setIsTimer(prev => !prev)}>
      {isTimer ? `스톱워치로 변경` : `타이머로 변경`}
      </button>
    {isTimer ?   ( <Timer time={time} setTime={setTime} />)
      :(<StopWatch time={time} setTime={setTime}/>)}
      <Advice />
     
      <TodoInput setTodo={setTodo} />
      <TodoList todo={todo} setTodo={setTodo}
      setCurrentTodo = {setCurrentTodo}
      currentTodo={currentTodo}/>
    </>
  )
}

// 이 아래는 TO-DO List에 대한 부분입니다.
const TodoInput = ({ setTodo }) => {
  const inputRef = useRef(null)
  const addTodo = () => {
    const newTodo = {
      content: inputRef.current.value,
      time:0,
    }
    fetch("http://localhost:3000/todo", {
      method: "POST",
      body: JSON.stringify(newTodo),
    }).then((res) => res.json())
      .then((res) => setTodo((prev) =>
        [...prev, res]))
  }
  return (
    <>
      <input ref={inputRef} />
      <button onClick={addTodo}>추가하기</button>
    </>
  )
}

const TodoList = ({ todo, setTodo , setCurrentTodo,currentTodo }) => {
  return (
    <>
      <ul>
        {todo.map((el) => (
          <Todo
          key={el.id}
            todo={el}
            setTodo={setTodo}
            currentTodo={currentTodo}
            setCurrentTodo={setCurrentTodo} />
        ))}
      </ul>
    </>
  )
}

const Todo = ({ todo, setTodo,
  setCurrentTodo,currentTodo}) => {
  return (
    <li className={currentTodo === todo.id ? `current` : ``}>
      <div>
        {todo.content}
        <br/>
        {formatTime(todo.time)}
      </div>
      <div>
      <button onClick={()=> setCurrentTodo(todo.id)}>
      시작하기 
      </button>
      <button onClick={
        () => fetch(`http://localhost:3000/todo/${todo.id}`,
        { method: "DELETE", })
        .then((res) => {
          if (res.ok) {
            setTodo((prev) => prev.filter((el) => el.id !== todo.id))
          }
        })
      }>
        삭제
      </button>
      </div>
    </li>
  )
}
// 명언을 띄워주는 부분을 구현한 코드입니다.
const useFetch = (url) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setData(res)
        setIsLoading(false)
      })
  }, [url])
  return [isLoading, data]
}

const Advice = () => {
  const [isLoading, data] = useFetch
    ("https://korean-advice-open-api.vercel.app/api/advice")

  useEffect(() => {

  }, [])
  return (
    <>
      {data && (
        <>
          <div>{data.message}</div>
          <div>-{data.author}-</div>
        </>
      )}
    </>
  )
}

// 다음 주석까지는 시계와 타이머, 스탑워치에 대한 부분입니다.
const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    setInterval(() => {
      setTime(new Date())
    }, 1000);
  }, [])
  return (
    <div>{time.toLocaleTimeString()}</div>
  )
}

const formatTime = (seconds) => {
  const TimeString = `${String(Math.floor(seconds / 3600))
    .padStart(2, "0")}:
${String(Math.floor((seconds % 3600) / 60))
      .padStart(2, "0")}:
${String(seconds % 60)
      .padStart(2, "0")}`;
  return (
    <>
      {TimeString}
    </>
  )
}

const StopWatch = ({time, setTime}) => {
  const [isOn, setIsOn] = useState(false)
  const TimerRef = useRef(null)
  console.log(TimerRef)
  useEffect(() => {
    if (isOn === true) {
      const TimerId = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
      TimerRef.current = TimerId
    } else {
      clearInterval(TimerRef.current)
    }
  }, [isOn])

  return (
    <div>
      {formatTime(time)}
      <button onClick={() => setIsOn((prev) => !prev)
      }>
        {isOn ? "끄기" : "켜기"}</button>
      <button onClick={(() => {
        setTime(0)
        setIsOn(false)
      })}>리셋</button>
    </div>
  );
}

const Timer = ({time,setTime}) => {
  const [StartTime, setStartTime] = useState(0)
  const [isOn, setIsOn] = useState(false)
  const TimerRef = useRef(null)

  useEffect(() => {
    if (isOn && time > 0) {
      const timerId = setInterval(() => {
        setTime(prev => prev - 1)
      }, 1000);
      TimerRef.current = timerId
    }
    else if (!isOn || time == 0) {
      clearInterval(TimerRef.current)
    }
    return () => clearInterval(TimerRef.current)
  }, [isOn, time])

  return (
    <div>
      <div>
        {time ? formatTime(time) : formatTime(StartTime)}
        <button onClick={() => {
          setIsOn(true)
          setTime(time ? time : StartTime)
          setStartTime(0)
        }}>시작
        </button>

        <button onClick={() => setIsOn(false)}>멈춤</button>
        <button onClick={() => setTime(0)}>리셋</button>
      </div>
      <input type='range'
        value={StartTime}
        max={3600}
        step={30}
        onChange={() => setStartTime(event.target.value)} />
    </div>
  )
}



export default App