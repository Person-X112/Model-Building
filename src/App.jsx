import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BuildingComponent from './components/buildingComponent.jsx'
import WrappedBuildingComponent from './components/buildingComponent.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{margin:0, padding:0}}>
      <WrappedBuildingComponent/>
      </div>
  )
}

export default App
