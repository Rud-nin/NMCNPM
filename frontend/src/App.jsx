import { Routes, Route } from "react-router";
import { SignUpPage } from './pages/signup/SignUpPage'
import { SignInPage } from './pages/signin/SignInPage';
import Home from "./pages/home/Home";

// function App() {
//   return (
//     <Routes>
//       <Route path="signin" element={<SignInPage />} />
//       <Route path="signup" element={<SignUpPage />} />
//     </Routes>
//   );
// }

function App() {
  return <Home />;
}

export default App;
