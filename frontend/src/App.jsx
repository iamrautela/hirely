
import { SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import './App.css'

function App() {


  return (
    <>
      <h1>Welcome to Hirely</h1>
      <SignedOut>
        <SignInButton mode="modal"/>
      </SignedOut>

      <UserButton />
    </>
  );
}

export default App
