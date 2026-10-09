import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from './LoginForm'
import QrCodeGenerator from './QR-codeGenerator'

const App = () => {
  return (
   <BrowserRouter>
            <Routes>

                <Route path="/" element={<LoginForm />} />

                <Route path="/QrCodeGenerator" element={<QrCodeGenerator />} />

            </Routes>
        </BrowserRouter>
  )
}

export default App