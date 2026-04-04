import { Scene } from '@/components/Scene'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Overlay } from '@/components/ui/Overlay'

function App() {
  return (
    <>
      <Scene />
      <LoadingScreen />
      <Overlay />
    </>
  )
}

export default App
