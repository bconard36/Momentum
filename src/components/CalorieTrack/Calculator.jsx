import { useState } from 'react'
import '../../styles/base.css'
import CalculatorForm from './components/CalculatorForm'
import Header from './components/Header'


// ============================================================
// Calculator.jsx
// ============================================================

const Calculator = () => {

    return (
        <>
            <div className="calculator-tool calculator-container">
                <Header />
                <CalculatorForm />
            </div>
        </>
    )
}

export default Calculator;