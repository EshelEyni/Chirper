import { SideBar } from './components/side-bar/side-bar'
import { Routes, Route } from 'react-router-dom'
import routes from './routes'
import './styles/main.scss'

function RootComponent() {

  return (
    <div className="App">
      <SideBar />
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </div>
  )
}

export default RootComponent
