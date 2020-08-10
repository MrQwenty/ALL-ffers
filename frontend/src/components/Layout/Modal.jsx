import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Modal(props) {
  const { isOpen, onCloseHandler, onSubmitHandler, children } = props

  const elRef = useRef(null)
  if (!elRef.current) {
    const div = document.createElement('div')
    elRef.current = div
  }

  useEffect(() => {
    const modalRoot = document.getElementById('modal')
    modalRoot.appendChild(elRef.current)
    return () => modalRoot.removeChild(elRef.current)
  }, [])

  return createPortal(
    <div className="modal-overlay" >
      <div className="modal-window">
        <button onClick={onCloseHandler}>X</button>
        {children}
      </div>
    </div>
    , elRef.current
  )
}
