import { useState } from 'react'
import '../../styles/base.css'
import Header from './components/Header'
import Results from './components/Results'
import CalculatorForm from './components/CalculatorForm'

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