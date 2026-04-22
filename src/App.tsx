// Import themeStore to ensure it initialises instantly (applies data-theme
// to <html> before React renders – zero flash of wrong theme).
import './store/themeStore'
import WorkflowBuilderPage from './pages/WorkflowBuilderPage'
import { MobileGuidanceScreen } from './components/ui/MobileGuidanceScreen'

export default function App() {
  return (
    <>
      <MobileGuidanceScreen />
      <WorkflowBuilderPage />
    </>
  )
}
