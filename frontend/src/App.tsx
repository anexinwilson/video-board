import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { Provider } from "react-redux"
import { store } from "./reducers/store"
import { Toaster } from "sonner"



function App() {

  return (
    <>
    <Provider store={store}>
      <Toaster position="top-center" richColors closeButton duration={2500}/>
    <RouterProvider router={router}/>
    </Provider>
    </>
  )
}

export default App
