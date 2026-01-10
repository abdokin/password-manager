import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Password Manager</h1>
      <p>React Frontend - Connected to Rails API</p>
      <p>Backend API: <code>http://localhost:3000</code></p>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App

